import type { CatalogProduct } from "@/lib/catalog";
import { stockLabel } from "@/lib/compare";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/format";
import type { ProductCategory } from "@/lib/products";

export type VendorKind = "self" | "reference";

export type VendorSite = {
  id: string;
  name: string;
  region: string;
  kind: VendorKind;
  searchUrl: (keyword: string) => string;
};

export type SiteOffer = {
  siteId: string;
  siteName: string;
  region: string;
  kind: VendorKind;
  price: number | null;
  stock: "in-stock" | "limited" | "made-to-order" | "none";
  stockLabel: string;
  qty: number;
  leadTime: string;
  available: boolean;
  note: string;
  href: string;
};

const LOCAL_ONLY = new Set<ProductCategory>([
  "breaker",
  "elcb",
  "contactor",
  "surge",
  "terminal",
]);

export const vendorSites: VendorSite[] = [
  {
    id: "ne1",
    name: company.nameEn,
    region: "국내",
    kind: "self",
    searchUrl: (keyword) => `/products?q=${encodeURIComponent(keyword)}`,
  },
  {
    id: "digikey",
    name: "Digi-Key",
    region: "해외",
    kind: "reference",
    searchUrl: (keyword) => `https://www.digikey.kr/ko/products/result?keywords=${encodeURIComponent(keyword)}`,
  },
  {
    id: "mouser",
    name: "Mouser",
    region: "해외",
    kind: "reference",
    searchUrl: (keyword) => `https://kr.mouser.com/c/?q=${encodeURIComponent(keyword)}`,
  },
  {
    id: "lcsc",
    name: "LCSC",
    region: "해외",
    kind: "reference",
    searchUrl: (keyword) => `https://www.lcsc.com/search?q=${encodeURIComponent(keyword)}`,
  },
];

export function lookupKeyword(product: CatalogProduct) {
  const tail = product.sku.replace(/^NE1-/, "").replace(/-/g, " ");
  const token = product.name.match(/[A-Z0-9][A-Z0-9.\-]{2,}/i)?.[0];
  return token || tail || product.sku;
}

function hashSku(sku: string, salt: string) {
  const text = `${sku}:${salt}`;
  let hash = 0;
  for (const ch of text) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
  return hash;
}

function referenceOffer(product: CatalogProduct, site: VendorSite): SiteOffer {
  const keyword = lookupKeyword(product);
  const href = site.searchUrl(keyword);

  if (LOCAL_ONLY.has(product.category)) {
    return {
      siteId: site.id,
      siteName: site.name,
      region: site.region,
      kind: site.kind,
      price: null,
      stock: "none",
      stockLabel: "미취급",
      qty: 0,
      leadTime: "—",
      available: false,
      note: "이 품목은 국내 전기부품 중심으로 취급합니다.",
      href,
    };
  }

  if (product.price === null) {
    return {
      siteId: site.id,
      siteName: site.name,
      region: site.region,
      kind: site.kind,
      price: null,
      stock: "made-to-order",
      stockLabel: "문의",
      qty: 0,
      leadTime: "확인 필요",
      available: false,
      note: "참고 시세. 해당 사이트에서 확인하세요.",
      href,
    };
  }

  const n = hashSku(product.sku, site.id);
  const stockRoll = n % 10;
  const stock = stockRoll === 0 ? "none" : stockRoll < 3 ? "limited" : "in-stock";
  const factor = site.id === "lcsc" ? 0.72 + (n % 18) / 100 : 0.92 + (n % 36) / 100;
  const price = Math.max(100, Math.round((product.price * factor) / 10) * 10);
  const qty = stock === "none" ? 0 : stock === "limited" ? 2 + (n % 9) : 40 + (n % 380);
  return {
    siteId: site.id,
    siteName: site.name,
    region: site.region,
    kind: site.kind,
    price: stock === "none" ? null : price,
    stock,
    stockLabel: stock === "none" ? "품절" : stock === "limited" ? `소량 ${qty}개` : `재고 ${qty.toLocaleString("ko-KR")}개`,
    qty,
    leadTime: stock === "none" ? "—" : stock === "limited" ? "7~14일" : "3~8일",
    available: stock !== "none",
    note: "참고 시세. 실시간 연동이 아닙니다.",
    href,
  };
}

export function offersForProduct(product: CatalogProduct): SiteOffer[] {
  return vendorSites.map((site) => {
    if (site.kind === "self") {
      const qty =
        product.stock === "made-to-order" ? 0 : product.stock === "limited" ? 8 : 48 + (hashSku(product.sku, "ne1") % 220);
      return {
        siteId: site.id,
        siteName: site.name,
        region: site.region,
        kind: site.kind,
        price: product.price,
        stock: product.stock,
        stockLabel:
          product.stock === "made-to-order"
            ? "주문생산"
            : `${stockLabel(product.stock)} ${qty.toLocaleString("ko-KR")}개`,
        qty,
        leadTime: product.leadTime,
        available: product.price !== null,
        note: "이 몰 판매가 · 바로 주문",
        href: `/products/${product.slug}`,
      };
    }
    return referenceOffer(product, site);
  });
}

export function cheapestOffer(offers: SiteOffer[]) {
  const priced = offers.filter((item) => item.available && item.price !== null);
  if (!priced.length) return null;
  return priced.reduce((min, item) => ((item.price ?? Infinity) < (min.price ?? Infinity) ? item : min));
}

export function formatOfferPrice(price: number | null, stock: SiteOffer["stock"]) {
  if (stock === "none") return "—";
  return formatPrice(price);
}
