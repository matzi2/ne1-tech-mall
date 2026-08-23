import type { CatalogProduct } from "@/lib/catalog";
import { company } from "@/lib/company";

export const shopNav = [
  { href: "/", label: "홈" },
  { href: "/products", label: "제품몰" },
  { href: "/compare", label: "스펙서치" },
  { href: "/company", label: "회사소개" },
  { href: "/inquiry", label: "고객센터" },
] as const;

export const shopBanners = [
  {
    id: "today",
    kicker: "오늘 추천",
    title: "현장 유지보수 부품, 오늘 바로 담으세요",
    body: "차단기·접촉기·전원장치를 품목별로 찾고 송금 또는 카드로 주문합니다. 회원 구매 시 1% 적립.",
    href: "/products",
    cta: "제품몰 보기",
  },
  {
    id: "stock",
    kicker: "당일~1일 출고",
    title: "재고 있는 단자대·퓨즈부터",
    body: "당일 출고 가능한 소모품을 먼저 보여 드립니다. 품번으로 검색해도 됩니다.",
    href: "/products?sort=stock",
    cta: "재고 상품",
  },
  {
    id: "cs",
    kicker: "고객센터",
    title: `TEL ${company.phone}`,
    body: `${company.hours}. 견적·재고 확인은 전화 또는 문의 게시판으로 받습니다.`,
    href: "/inquiry",
    cta: "견적·문의",
  },
] as const;

export const shopSteps = [
  { n: "1", label: "홈·검색", href: "/" },
  { n: "2", label: "상품 담기", href: "/products" },
  { n: "3", label: "주문·결제", href: "/checkout" },
  { n: "4", label: "출고 안내", href: "/inquiry" },
] as const;

export type ShopSort = "featured" | "price-asc" | "price-desc" | "stock";

export const shopSorts: { id: ShopSort; label: string }[] = [
  { id: "featured", label: "추천순" },
  { id: "price-asc", label: "낮은 가격" },
  { id: "price-desc", label: "높은 가격" },
  { id: "stock", label: "빠른 출고" },
];

function priceValue(product: CatalogProduct) {
  return product.price ?? Number.POSITIVE_INFINITY;
}

export function sortCatalog(items: CatalogProduct[], sort: ShopSort) {
  const next = items.slice();
  if (sort === "price-asc") next.sort((a, b) => priceValue(a) - priceValue(b));
  if (sort === "price-desc") next.sort((a, b) => priceValue(b) - priceValue(a));
  if (sort === "stock") {
    const rank = { "in-stock": 0, limited: 1, "made-to-order": 2 };
    next.sort((a, b) => rank[a.stock] - rank[b.stock] || priceValue(a) - priceValue(b));
  }
  if (sort === "featured") {
    next.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
  return next;
}

export function todayPicks(items: CatalogProduct[]) {
  const featured = items.filter((item) => item.featured);
  return (featured.length ? featured : items).slice(0, 4);
}

export function bestSellers(items: CatalogProduct[]) {
  return items
    .filter((item) => item.stock === "in-stock" && item.price)
    .slice()
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    .slice(0, 8);
}

export function relatedProducts(items: CatalogProduct[], slug: string, category: CatalogProduct["category"]) {
  const same = items.filter((item) => item.category === category && item.slug !== slug);
  return (same.length ? same : items.filter((item) => item.slug !== slug)).slice(0, 4);
}
