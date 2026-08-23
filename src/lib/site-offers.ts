import type { CatalogProduct } from "@/lib/catalog";
import { stockLabel } from "@/lib/compare";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/format";

export type VendorKind = "self" | "reference";
export type OfferSource = "live" | "local" | "unavailable";

export type VendorSite = {
  id: "ne1" | "digikey" | "mouser";
  name: string;
  region: string;
  kind: VendorKind;
  searchUrl: (keyword: string) => string;
};

export type SiteOffer = {
  siteId: VendorSite["id"];
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
  source: OfferSource;
  updatedAt?: string;
  partNumber?: string;
};

export type OfferLookupItem = {
  slug: string;
  sku: string;
  name: string;
  price: number | null;
  stock: CatalogProduct["stock"];
  leadTime: string;
};

export type OfferLookupResult = {
  slug: string;
  keyword: string;
  updatedAt: string;
  offers: SiteOffer[];
};

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
];

export function lookupKeyword(product: Pick<CatalogProduct, "sku" | "name">) {
  const tail = product.sku.replace(/^NE1-/, "").replace(/-/g, " ");
  const token = product.name.match(/[A-Z0-9][A-Z0-9.\-]{2,}/i)?.[0];
  return token || tail || product.sku;
}

export function toLookupItem(product: CatalogProduct): OfferLookupItem {
  return {
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    price: product.price,
    stock: product.stock,
    leadTime: product.leadTime,
  };
}

export function localNe1Offer(product: OfferLookupItem, updatedAt: string): SiteOffer {
  const qty = product.stock === "made-to-order" ? 0 : product.stock === "limited" ? 8 : 120;
  return {
    siteId: "ne1",
    siteName: company.nameEn,
    region: "국내",
    kind: "self",
    price: product.price,
    stock: product.stock,
    stockLabel:
      product.stock === "made-to-order" ? "주문생산" : `${stockLabel(product.stock)} ${qty.toLocaleString("ko-KR")}개`,
    qty,
    leadTime: product.leadTime,
    available: product.price !== null,
    note: "이 몰 판매가",
    href: `/products/${product.slug}`,
    source: "live",
    updatedAt,
    partNumber: product.sku,
  };
}

export function vendorById(id: VendorSite["id"]) {
  const site = vendorSites.find((item) => item.id === id);
  if (!site) throw new Error(`unknown vendor ${id}`);
  return site;
}

export function waitingOffer(
  site: VendorSite,
  keyword: string,
  note: string,
  updatedAt: string,
  stockLabel = "검색 중",
): SiteOffer {
  return {
    siteId: site.id,
    siteName: site.name,
    region: site.region,
    kind: site.kind,
    price: null,
    stock: "none",
    stockLabel,
    qty: 0,
    leadTime: "—",
    available: false,
    note,
    href: site.searchUrl(keyword),
    source: "unavailable",
    updatedAt,
  };
}

export function placeholderOffers(product: CatalogProduct): SiteOffer[] {
  const updatedAt = new Date().toISOString();
  const keyword = lookupKeyword(product);
  const item = toLookupItem(product);
  return [
    localNe1Offer(item, updatedAt),
    waitingOffer(vendorById("digikey"), keyword, "Digi-Key 검색 대기", updatedAt),
    waitingOffer(vendorById("mouser"), keyword, "Mouser 검색 대기", updatedAt),
  ];
}

export function cheapestOffer(offers: SiteOffer[]) {
  const priced = offers.filter((item) => item.available && item.price !== null);
  if (!priced.length) return null;
  return priced.reduce((min, item) => ((item.price ?? Infinity) < (min.price ?? Infinity) ? item : min));
}

export function formatOfferPrice(offer: SiteOffer) {
  if (offer.price === null) return "—";
  return formatPrice(offer.price);
}

export function formatOfferTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
