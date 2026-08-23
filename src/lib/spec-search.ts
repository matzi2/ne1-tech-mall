import type { CatalogProduct } from "@/lib/catalog";
import { filterCatalog } from "@/lib/catalog";
import { matchTaxonomy, type CategoryGroupId, type ProductCategory } from "@/lib/products";

export const priceBands = [
  { id: "all", label: "가격 전체" },
  { id: "under10", label: "1만 원 미만" },
  { id: "10to30", label: "1만~3만 원" },
  { id: "30to50", label: "3만~5만 원" },
  { id: "over50", label: "5만 원 이상" },
] as const;

export type PriceBand = (typeof priceBands)[number]["id"];

export const stockFilters = [
  { id: "all", label: "재고 전체" },
  { id: "in-stock", label: "재고" },
  { id: "limited", label: "소량" },
  { id: "made-to-order", label: "주문생산" },
] as const;

export type StockFilter = (typeof stockFilters)[number]["id"];

export type SpecSearchFilters = {
  query: string;
  group: CategoryGroupId | "all";
  category: ProductCategory | "all";
  stock: StockFilter;
  priceBand: PriceBand;
  specs: Record<string, string>;
};

export const defaultSpecFilters: SpecSearchFilters = {
  query: "",
  group: "all",
  category: "all",
  stock: "all",
  priceBand: "all",
  specs: {},
};

export function inPriceBand(price: number | null, band: PriceBand) {
  if (band === "all") return true;
  if (price === null) return false;
  if (band === "under10") return price < 10000;
  if (band === "10to30") return price >= 10000 && price < 30000;
  if (band === "30to50") return price >= 30000 && price < 50000;
  return price >= 50000;
}

export function applySpecFilters(items: CatalogProduct[], filters: SpecSearchFilters) {
  let list = filterCatalog(items, filters.query).filter((item) =>
    matchTaxonomy(item.category, filters.group, filters.category),
  );
  if (filters.stock !== "all") list = list.filter((item) => item.stock === filters.stock);
  list = list.filter((item) => inPriceBand(item.price, filters.priceBand));
  for (const [label, value] of Object.entries(filters.specs)) {
    if (!value) continue;
    list = list.filter((item) => item.specs.some((spec) => spec.label === label && spec.value === value));
  }
  return list;
}

export function specFacets(items: CatalogProduct[]) {
  const map = new Map<string, Set<string>>();
  for (const item of items) {
    for (const spec of item.specs) {
      const set = map.get(spec.label) ?? new Set<string>();
      set.add(spec.value);
      map.set(spec.label, set);
    }
  }
  return [...map.entries()]
    .map(([label, values]) => ({ label, values: [...values].sort((a, b) => a.localeCompare(b, "ko")) }))
    .filter((facet) => facet.values.length >= 2)
    .slice(0, 6);
}

export function brandOf(product: CatalogProduct) {
  return "NE1-TECH";
}
