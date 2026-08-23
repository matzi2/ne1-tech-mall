import type { CatalogProduct } from "@/lib/catalog";
import {
  categoryGroups,
  getCategoryGroup,
  getCategoryLabel,
  type CategoryGroupId,
  type ProductCategory,
} from "@/lib/products";

export type SearchStock = "in-stock" | "limited" | "made-to-order";

export type SearchIntent = {
  raw: string;
  categories: ProductCategory[];
  groups: CategoryGroupId[];
  specValues: string[];
  stock: SearchStock | null;
  priceHint: "cheap" | "expensive" | null;
  keywords: string[];
  summary: string;
  conversational: boolean;
};

const CATEGORY_ALIASES: { keys: string[]; category: ProductCategory }[] = [
  { keys: ["mccb", "배선용차단기", "배선용", "주차단기"], category: "breaker" },
  { keys: ["elcb", "누전차단기", "누전", "감전", "누설"], category: "elcb" },
  { keys: ["차단기", "브레이커", "breaker"], category: "breaker" },
  { keys: ["접촉기", "마그넷", "컨택터", "contactor"], category: "contactor" },
  { keys: ["릴레이", "보조릴레이", "relay"], category: "relay" },
  { keys: ["smps", "스위칭전원", "파워서플라이", "전원장치", "아답터", "어댑터"], category: "power" },
  { keys: ["전원", "파워"], category: "power" },
  { keys: ["배터리", "건전지", "18650", "홀더"], category: "battery" },
  { keys: ["단자대", "터미널", "din"], category: "terminal" },
  { keys: ["커넥터", "핀헤더", "xh", "하우징"], category: "connector" },
  { keys: ["기판", "pcb", "만능기판", "프로토"], category: "pcb" },
  { keys: ["서지", "spd", "낙뢰", "서지보호"], category: "surge" },
  { keys: ["퓨즈", "fuse"], category: "fuse" },
  { keys: ["택트", "토글", "스위치"], category: "switch" },
  { keys: ["레귤레이터", "7805", "리니어", "ic"], category: "ic" },
  { keys: ["트랜지스터", "다이오드", "2n2222", "디스크리트"], category: "discrete" },
  { keys: ["온습도", "온도센서", "습도", "dht", "근접센서", "센서"], category: "sensor" },
  { keys: ["저항", "콘덴서", "커패시터", "인덕터", "수동소자", "10k"], category: "passive" },
  { keys: ["아두이노", "우노", "uno", "개발보드", "mcu", "마이컴"], category: "mcu" },
  { keys: ["led", "엘이디", "표시등"], category: "led" },
  { keys: ["lcd", "디스플레이", "문자액정"], category: "lcd" },
  { keys: ["모터", "기어드", "dc모터"], category: "motor" },
  { keys: ["전선", "케이블", "점퍼", "awg"], category: "cable" },
  { keys: ["납땜", "인두", "공구"], category: "tool" },
  { keys: ["멀티미터", "테스터", "계측"], category: "meter" },
];

const GROUP_ALIASES: { keys: string[]; group: CategoryGroupId }[] = [
  { keys: ["반도체", "전자부품"], group: "semicon" },
  { keys: ["수동소자", "rlc"], group: "passive" },
  { keys: ["전기부품"], group: "electric" },
  { keys: ["제어기기", "제어"], group: "control" },
];

const FILLER =
  /^(찾아|찾아줘|찾아주세요|필요|필요해|주세요|좀|있나|있나요|있는|보여줘|추천|원해요|하고싶어|하고 싶어)$/;

function compact(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

export function looksConversational(query: string) {
  const q = query.trim();
  return q.length >= 12 || /찾아|필요|주세요|있나|추천|보여/.test(q);
}

export function parseSearchIntent(query: string): SearchIntent {
  const raw = query.trim();
  const normalized = raw.toLowerCase();
  const compactQuery = compact(raw);
  const categories: ProductCategory[] = [];
  const groups: CategoryGroupId[] = [];
  const specValues: string[] = [];
  let stock: SearchStock | null = null;
  let priceHint: SearchIntent["priceHint"] = null;

  if (/(누전|감전|누설)/.test(normalized)) categories.push("elcb");

  for (const alias of CATEGORY_ALIASES) {
    if (alias.keys.some((key) => compactQuery.includes(compact(key)))) {
      categories.push(alias.category);
    }
  }
  for (const alias of GROUP_ALIASES) {
    if (alias.keys.some((key) => compactQuery.includes(compact(key)))) {
      groups.push(alias.group);
    }
  }

  if (categories.includes("elcb")) {
    const filtered = categories.filter((item) => item !== "breaker");
    categories.splice(0, categories.length, ...filtered);
  }

  const pole = normalized.match(/(\d+)\s*(극|p)(?![a-z])/i);
  if (pole) specValues.push(`${pole[1]}P`);

  const amp = normalized.match(/(\d+(?:\.\d+)?)\s*(a|암페어|에이)\b/i);
  if (amp) specValues.push(`${amp[1]}A`);

  const milli = normalized.match(/(\d+(?:\.\d+)?)\s*ma\b/i);
  if (milli) specValues.push(`${milli[1]}mA`);

  const volt = normalized.match(/(\d+(?:\.\d+)?)\s*(v|볼트)\b/i);
  if (volt) specValues.push(`${volt[1]}V`);

  const watt = normalized.match(/(\d+(?:\.\d+)?)\s*(w|와트)\b/i);
  if (watt) specValues.push(`${watt[1]}W`);

  const ohm = normalized.match(/(\d+(?:\.\d+)?)\s*(k)?\s*(ω|옴|ohm|Ω)/i);
  if (ohm) specValues.push(`${ohm[1]}${ohm[2] ? "k" : ""}Ω`);
  const kilo = normalized.match(/(\d+)\s*k(?![a-z])/i);
  if (kilo && !ohm) specValues.push(`${kilo[1]}kΩ`);

  if (/재고|당일|바로\s*출고|있는\s*거|재고있/.test(normalized)) stock = "in-stock";
  if (/소량|한정/.test(normalized)) stock = "limited";
  if (/주문생산|맞춤|제작/.test(normalized)) stock = "made-to-order";
  if (/싼|저렴|저가|싸게/.test(normalized)) priceHint = "cheap";
  if (/비싼|고가/.test(normalized)) priceHint = "expensive";

  const keywords = raw
    .split(/[\s,/|+]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !FILLER.test(item.toLowerCase()))
    .filter((item) => !CATEGORY_ALIASES.some((alias) => alias.keys.includes(item.toLowerCase())))
    .filter((item) => !/^(재고|당일|있는|저렴|싼|비싼|찾아줘|찾아주세요)$/.test(item));

  const summaryParts = [
    ...unique(categories).map((id) => getCategoryLabel(id)),
    ...unique(groups).map((id) => categoryGroups.find((group) => group.id === id)?.label ?? id),
    ...unique(specValues),
    stock === "in-stock" ? "재고" : stock === "limited" ? "소량" : stock === "made-to-order" ? "주문생산" : "",
    priceHint === "cheap" ? "낮은 가격" : priceHint === "expensive" ? "높은 가격" : "",
  ].filter(Boolean);

  return {
    raw,
    categories: unique(categories),
    groups: unique(groups),
    specValues: unique(specValues),
    stock,
    priceHint,
    keywords,
    summary: summaryParts.join(" · ") || raw,
    conversational: looksConversational(raw),
  };
}

export function mergeSearchIntent(base: SearchIntent, extra: Partial<SearchIntent>): SearchIntent {
  const next: SearchIntent = {
    ...base,
    categories: unique([...(extra.categories ?? []), ...base.categories]),
    groups: unique([...(extra.groups ?? []), ...base.groups]),
    specValues: unique([...(extra.specValues ?? []), ...base.specValues]),
    stock: extra.stock ?? base.stock,
    priceHint: extra.priceHint ?? base.priceHint,
    keywords: unique([...(extra.keywords ?? []), ...base.keywords]),
  };
  const summaryParts = [
    ...next.categories.map((id) => getCategoryLabel(id)),
    ...next.specValues,
    next.stock === "in-stock" ? "재고" : "",
  ].filter(Boolean);
  next.summary = extra.summary || summaryParts.join(" · ") || base.summary;
  return next;
}

function textOf(product: CatalogProduct) {
  return [
    product.name,
    product.sku,
    product.manufacturer ?? "",
    product.summary,
    product.description,
    product.leadTime,
    getCategoryLabel(product.category),
    getCategoryGroup(product.category)?.label ?? "",
    ...product.specs.map((spec) => `${spec.label} ${spec.value}`),
  ]
    .join(" ")
    .toLowerCase();
}

export function scoreProduct(product: CatalogProduct, intent: SearchIntent) {
  if (!intent.raw) return 1;
  const hay = textOf(product);
  const q = intent.raw.toLowerCase();
  let score = 0;

  if (product.sku.toLowerCase() === q) score += 120;
  else if (product.sku.toLowerCase().includes(q.replace(/\s+/g, ""))) score += 80;
  else if (hay.includes(q)) score += 36;

  if (intent.categories.includes(product.category)) score += 34;
  if (intent.groups.includes(getCategoryGroup(product.category)?.id as CategoryGroupId)) score += 18;

  for (const spec of intent.specValues) {
    const needle = spec.toLowerCase();
    if (product.specs.some((item) => item.value.toLowerCase().replace(/\s+/g, "").includes(needle.replace(/\s+/g, "")))) {
      score += 28;
    } else if (hay.includes(needle.toLowerCase())) {
      score += 16;
    }
  }

  for (const word of intent.keywords) {
    if (word.length < 2) continue;
    if (hay.includes(word.toLowerCase())) score += 10;
  }

  if (intent.stock && product.stock === intent.stock) score += 10;
  if (intent.priceHint === "cheap" && product.price !== null) score += Math.max(0, 12 - Math.floor(product.price / 20000));
  if (intent.priceHint === "expensive" && product.price !== null) score += Math.min(12, Math.floor(product.price / 20000));
  if (product.featured) score += 2;

  return score;
}

export function searchWithIntent(items: CatalogProduct[], intent: SearchIntent) {
  if (!intent.raw.trim()) return items;
  const ranked = items
    .map((item) => ({ item, score: scoreProduct(item, intent) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);
  if (ranked.length) return ranked.map((row) => row.item);
  const q = intent.raw.toLowerCase();
  return items.filter((item) => textOf(item).includes(q));
}

export function searchCatalog(items: CatalogProduct[], query: string) {
  return searchWithIntent(items, parseSearchIntent(query));
}
