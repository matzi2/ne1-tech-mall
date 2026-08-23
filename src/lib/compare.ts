import type { CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getCategoryLabel } from "@/lib/products";

export const COMPARE_STORAGE = "ne1-compare-v024";
export const COMPARE_MAX = 4;

export type CompareRow = {
  key: string;
  label: string;
  values: string[];
  differs: boolean;
};

export function stockLabel(stock: CatalogProduct["stock"]) {
  if (stock === "in-stock") return "재고";
  if (stock === "limited") return "소량";
  return "주문생산";
}

export function parseCompareSlugs(value: string | null | undefined) {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, COMPARE_MAX);
}

export function buildCompareRows(products: CatalogProduct[]): CompareRow[] {
  const specLabels = [...new Set(products.flatMap((item) => item.specs.map((spec) => spec.label)))];
  const rows: { key: string; label: string; values: string[] }[] = [
    {
      key: "brand",
      label: "브랜드",
      values: products.map(() => "NE1-TECH"),
    },
    {
      key: "category",
      label: "품목",
      values: products.map((item) => getCategoryLabel(item.category)),
    },
    {
      key: "sku",
      label: "품번",
      values: products.map((item) => item.sku),
    },
    {
      key: "price",
      label: "가격",
      values: products.map((item) => formatPrice(item.price)),
    },
    {
      key: "stock",
      label: "재고",
      values: products.map((item) => stockLabel(item.stock)),
    },
    {
      key: "lead",
      label: "납기",
      values: products.map((item) => item.leadTime),
    },
    ...specLabels.map((label) => ({
      key: `spec:${label}`,
      label,
      values: products.map((item) => item.specs.find((spec) => spec.label === label)?.value ?? "—"),
    })),
  ];

  return rows.map((row) => ({
    ...row,
    differs: row.values.some((value) => value !== row.values[0]),
  }));
}

export function cheapestSlug(products: CatalogProduct[]) {
  const priced = products.filter((item) => typeof item.price === "number");
  if (priced.length < 2) return null;
  const min = Math.min(...priced.map((item) => item.price as number));
  const winners = priced.filter((item) => item.price === min);
  return winners.length === 1 ? winners[0].slug : null;
}
