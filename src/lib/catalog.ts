import { slugify } from "@/lib/utils";
import type { Product, ProductCategory } from "@/lib/products";
import { categories } from "@/lib/products";
import { searchCatalog } from "@/lib/smart-search";

export type ProductMedia = {
  id: string;
  name: string;
  kind: "photo" | "document" | "catalog";
  mimeType: string;
  size: number;
  dataUrl: string;
};

export type CatalogSource = "seed" | "file" | "photo" | "document" | "manual";

export type CatalogProduct = Product & {
  photos: ProductMedia[];
  documents: ProductMedia[];
  source: CatalogSource;
  createdAt: string;
};

export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
export const DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.hwp,.hwpx,.xls,.xlsx,.ppt,.pptx,.txt,.dwg,.dxf,application/pdf";
export const CATALOG_ACCEPT = ".csv,.tsv,.json,.txt,text/csv,application/json";

export const MAX_FILE_BYTES = 4 * 1024 * 1024;

const categoryIds = categories
  .map((item) => item.id)
  .filter((id): id is ProductCategory => id !== "all");

export function isProductCategory(value: string): value is ProductCategory {
  return categoryIds.includes(value as ProductCategory);
}

export function parseCategory(value: string): ProductCategory {
  const normalized = value.trim().toLowerCase();
  const compact = normalized.replace(/\s+/g, "");
  const aliases: Record<string, ProductCategory> = {
    ic: "ic",
    반도체: "ic",
    레귤레이터: "ic",
    discrete: "discrete",
    트랜지스터: "discrete",
    다이오드: "discrete",
    sensor: "sensor",
    센서: "sensor",
    passive: "passive",
    수동소자: "passive",
    저항: "passive",
    콘덴서: "passive",
    mcu: "mcu",
    개발보드: "mcu",
    led: "led",
    lcd: "lcd",
    breaker: "breaker",
    mccb: "breaker",
    배선용차단기: "breaker",
    차단기: "breaker",
    elcb: "elcb",
    누전차단기: "elcb",
    contactor: "contactor",
    전자접촉기: "contactor",
    접촉기: "contactor",
    power: "power",
    smps: "power",
    전원장치: "power",
    전원: "power",
    스위칭전원: "power",
    battery: "battery",
    배터리: "battery",
    connector: "connector",
    커넥터: "connector",
    terminal: "terminal",
    단자대: "terminal",
    단자: "terminal",
    pcb: "pcb",
    기판: "pcb",
    만능기판: "pcb",
    switch: "switch",
    스위치: "switch",
    surge: "surge",
    spd: "surge",
    서지보호기: "surge",
    서지: "surge",
    relay: "relay",
    보조릴레이: "relay",
    릴레이: "relay",
    fuse: "fuse",
    퓨즈: "fuse",
    퓨즈홀더: "fuse",
    motor: "motor",
    모터: "motor",
    cable: "cable",
    케이블: "cable",
    전선: "cable",
    tool: "tool",
    공구: "tool",
    납땜: "tool",
    meter: "meter",
    계측: "meter",
    멀티미터: "meter",
  };
  if (isProductCategory(normalized)) return normalized;
  return aliases[compact] ?? "terminal";
}

export function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-" || trimmed.includes("견적")) return null;
  const n = Number(trimmed.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseStock(value: string): Product["stock"] {
  const v = value.trim();
  if (v.includes("주문") || v === "made-to-order") return "made-to-order";
  if (v.includes("한정") || v === "limited") return "limited";
  return "in-stock";
}

function splitRow(line: string, delimiter: string) {
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
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function toProduct(row: Record<string, string>, index: number): CatalogProduct {
  const sku = row.sku || row.품번 || row.상품코드 || `NE1-IMP-${Date.now()}-${index}`;
  const name = row.name || row.상품명 || row.제품명 || `미지정 상품 ${index + 1}`;
  const price = parsePrice(row.price || row.가격 || row.판매가 || "");
  return {
    slug: slugify(row.slug || sku || name),
    sku,
    name,
    summary: row.summary || row.요약 || row.한줄소개 || name,
    description: row.description || row.상세 || row.설명 || row.summary || name,
    category: parseCategory(row.category || row.카테고리 || row.분류 || "terminal"),
    price,
    leadTime: row.leadTime || row.납기 || "협의",
    stock: parseStock(row.stock || row.재고 || "in-stock"),
    featured: (row.featured || row.추천 || "") === "true" || row.추천 === "Y",
    specs: [],
    photos: [],
    documents: [],
    source: "file",
    createdAt: new Date().toISOString(),
  };
}

export function parseCatalogText(text: string, fileName: string): CatalogProduct[] {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return [];

  if (fileName.endsWith(".json") || trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as unknown;
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return rows.map((row, index) =>
      toProduct(
        Object.fromEntries(
          Object.entries(row as Record<string, unknown>).map(([key, value]) => [
            key,
            String(value ?? ""),
          ]),
        ),
        index,
      ),
    );
  }

  const delimiter = fileName.endsWith(".tsv") || trimmed.includes("\t")
    ? "\t"
    : ",";
  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("헤더와 데이터 행이 필요합니다.");
  }
  const headers = splitRow(lines[0], delimiter).map((h) => h.replace(/^\uFEFF/, ""));
  return lines.slice(1).map((line, index) => {
    const cells = splitRow(line, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cells[i] ?? "";
    });
    return toProduct(row, index);
  });
}

export function isPhotoFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

export function isDocumentFile(file: File) {
  return /\.(pdf|docx?|xlsx?|pptx?|hwp|hwpx|txt|dwg|dxf)$/i.test(file.name);
}

export function isCatalogFile(file: File) {
  return /\.(csv|tsv|json|txt)$/i.test(file.name);
}

export function filterCatalog(
  items: CatalogProduct[],
  query: string,
  category: ProductCategory | "all" = "all",
) {
  const list =
    category === "all" ? items : items.filter((item) => item.category === category);
  const q = query.trim();
  if (!q) return list;
  return searchCatalog(list, q);
}

export async function fileToMedia(
  file: File,
  kind: ProductMedia["kind"],
): Promise<ProductMedia> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name}은(는) 4MB를 넘습니다. 파일을 줄여 다시 올려 주세요.`);
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`${file.name}을(를) 읽지 못했습니다.`));
    reader.readAsDataURL(file);
  });
  return {
    id: `${kind}-${file.name}-${file.size}-${Date.now()}`,
    name: file.name,
    kind,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    dataUrl,
  };
}

export function productFromPhoto(file: File, photo: ProductMedia): CatalogProduct {
  const base = file.name.replace(/\.[^.]+$/, "");
  return {
    slug: slugify(`ne1-photo-${base}-${Date.now()}`),
    sku: `NE1-PH-${Date.now().toString().slice(-6)}`,
    name: base,
    summary: `${base} 사진으로 등록한 상품입니다.`,
    description:
      "제품 사진을 첨부해 등록했습니다. 사양과 가격은 관리 화면에서 이어서 수정할 수 있습니다.",
    category: "terminal",
    price: null,
    leadTime: "협의",
    stock: "in-stock",
    specs: [],
    photos: [photo],
    documents: [],
    source: "photo",
    createdAt: new Date().toISOString(),
  };
}

export function productFromDocument(file: File, document: ProductMedia): CatalogProduct {
  const base = file.name.replace(/\.[^.]+$/, "");
  return {
    slug: slugify(`ne1-doc-${base}-${Date.now()}`),
    sku: `NE1-DC-${Date.now().toString().slice(-6)}`,
    name: base,
    summary: `${base} 기술문서로 등록한 상품입니다.`,
    description:
      "사양서·도면·매뉴얼 문서를 첨부해 등록했습니다. 상품명과 가격은 관리 화면에서 보완할 수 있습니다.",
    category: "terminal",
    price: null,
    leadTime: "협의",
    stock: "made-to-order",
    specs: [],
    photos: [],
    documents: [document],
    source: "document",
    createdAt: new Date().toISOString(),
  };
}
