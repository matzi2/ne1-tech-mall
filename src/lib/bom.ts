import type { CatalogProduct } from "@/lib/catalog";
import { getCategoryGroup } from "@/lib/products";

export const BOM_STORAGE = "ne1-bom-v025";

export type BomLine = {
  slug: string;
  qty: number;
};

export type BomExportRow = BomLine & {
  sku: string;
  name: string;
  unitPrice: number | null;
  leadTime: string;
};

export function parseBomLines(raw: string | null | undefined): BomLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const lines: BomLine[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const slug = String((item as BomLine).slug ?? "").trim();
      const qty = Math.max(1, Math.floor(Number((item as BomLine).qty) || 1));
      if (!slug) continue;
      const existing = lines.find((line) => line.slug === slug);
      if (existing) existing.qty += qty;
      else lines.push({ slug, qty });
    }
    return lines;
  } catch {
    return [];
  }
}

export function bomLineTotal(unitPrice: number | null, qty: number) {
  if (unitPrice === null) return null;
  return unitPrice * qty;
}

export function bomCsv(rows: BomExportRow[]) {
  const header = ["품번", "제품명", "수량", "단가", "합계", "납기"];
  const lines = rows.map((row) =>
    [
      row.sku,
      row.name,
      String(row.qty),
      row.unitPrice === null ? "" : String(row.unitPrice),
      row.unitPrice === null ? "" : String(row.unitPrice * row.qty),
      row.leadTime,
    ].map(csvCell).join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function parseBomCsv(text: string) {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return [] as { sku: string; qty: number }[];
  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsv(lines[0]).map((item) => item.trim().toLowerCase());
  const skuIndex = headers.findIndex((item) => ["품번", "sku", "상품코드", "코드"].includes(item));
  const qtyIndex = headers.findIndex((item) => ["수량", "qty", "수량(ea)", "ea"].includes(item));
  if (skuIndex < 0) return [];
  return lines.slice(1).flatMap((line) => {
    const cells = splitCsv(line);
    const sku = (cells[skuIndex] ?? "").trim();
    if (!sku) return [];
    return [{ sku, qty: Math.max(1, Math.floor(Number(cells[qtyIndex] ?? 1) || 1)) }];
  });
}

function splitCsv(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

export function downloadTextFile(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function alternativeProducts(catalog: CatalogProduct[], product: CatalogProduct, limit = 4) {
  const sameCategory = catalog.filter((item) => item.slug !== product.slug && item.category === product.category);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const group = getCategoryGroup(product.category);
  const sameGroup = catalog.filter(
    (item) =>
      item.slug !== product.slug &&
      !sameCategory.some((other) => other.slug === item.slug) &&
      group?.children.includes(item.category),
  );
  return [...sameCategory, ...sameGroup].slice(0, limit);
}

export function resolveBomRows(catalog: CatalogProduct[], lines: BomLine[]) {
  return lines.flatMap((line) => {
    const product = catalog.find((item) => item.slug === line.slug);
    if (!product) return [];
    return [
      {
        ...line,
        product,
        lineTotal: bomLineTotal(product.price, line.qty),
      },
    ];
  });
}
