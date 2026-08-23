import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  localNe1Offer,
  lookupKeyword,
  vendorById,
  waitingOffer,
  type OfferLookupItem,
  type OfferLookupResult,
  type SiteOffer,
} from "@/lib/site-offers";

const CACHE_PATH = path.join("/tmp", "ne1-dk-mouser-cache.json");
const CACHE_TTL_MS = 2 * 60 * 1000;
const FETCH_MS = 4500;

type CacheFile = Record<string, { expiresAt: number; result: OfferLookupResult }>;

let fxMemory: { usdKrw: number; fetchedAt: number } | null = null;
let digikeyToken: { access: string; expiresAt: number } | null = null;

async function readCache(): Promise<CacheFile> {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8")) as CacheFile;
  } catch {
    return {};
  }
}

async function writeCache(value: CacheFile) {
  await mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(value));
}

async function fetchJson(url: string, init: RequestInit, timeout = FETCH_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    const text = await response.text();
    try {
      return { ok: response.ok, json: text ? JSON.parse(text) : null };
    } catch {
      return { ok: response.ok, json: null };
    }
  } finally {
    clearTimeout(timer);
  }
}

function parseMoney(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function usdToKrw() {
  if (fxMemory && Date.now() - fxMemory.fetchedAt < 60 * 60 * 1000) return fxMemory.usdKrw;
  const result = await fetchJson("https://open.er-api.com/v6/latest/USD", { method: "GET" }, 3000);
  const usdKrw = (result.json as { rates?: { KRW?: number } } | null)?.rates?.KRW;
  fxMemory = { usdKrw: usdKrw && usdKrw > 0 ? usdKrw : 1380, fetchedAt: Date.now() };
  return fxMemory.usdKrw;
}

function toKrw(amount: number, currency: string, usdKrw: number) {
  const code = currency.toUpperCase();
  if (code === "KRW" || code === "원") return Math.round(amount);
  return Math.round(amount * usdKrw);
}

async function lookupMouser(keyword: string, usdKrw: number, updatedAt: string): Promise<SiteOffer> {
  const site = vendorById("mouser");
  const key = process.env.MOUSER_API_KEY?.trim();
  if (!key) {
    return waitingOffer(
      site,
      keyword,
      "Mouser 검색 API 키가 있으면 검색 시 가격·재고가 갱신됩니다.",
      updatedAt,
      "키 필요",
    );
  }
  const result = await fetchJson(`https://api.mouser.com/api/v1/search/keyword?apiKey=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      SearchByKeywordRequest: { keyword, records: 1, startingRecord: 0 },
    }),
  });
  const part = (result.json as { SearchResults?: { Parts?: Record<string, unknown>[] } } | null)?.SearchResults?.Parts?.[0];
  if (!result.ok || !part) {
    return {
      ...waitingOffer(site, keyword, "Mouser에서 이 품번을 찾지 못했습니다.", updatedAt),
      stockLabel: "검색결과 없음",
      source: "live",
    };
  }
  const qty = Number(String(part.AvailabilityInStock ?? "").replace(/\D/g, "")) || 0;
  const unit = ((part.PriceBreaks as { Price?: string; Currency?: string }[] | undefined) ?? [])[0];
  const usd = parseMoney(unit?.Price);
  const price = usd ? toKrw(usd, unit?.Currency || "USD", usdKrw) : null;
  const stock = qty <= 0 ? "none" : qty < 10 ? "limited" : "in-stock";
  return {
    siteId: "mouser",
    siteName: site.name,
    region: site.region,
    kind: "reference",
    price,
    stock,
    stockLabel: qty <= 0 ? "품절" : stock === "limited" ? `소량 ${qty}개` : `재고 ${qty.toLocaleString("ko-KR")}개`,
    qty,
    leadTime: String(part.LeadTime || "확인"),
    available: qty > 0 && price !== null,
    note: "Mouser 검색 시점",
    href: String(part.ProductDetailUrl || site.searchUrl(keyword)),
    source: "live",
    updatedAt,
    partNumber: String(part.ManufacturerPartNumber || part.MouserPartNumber || keyword),
  };
}

async function digikeyAccessToken() {
  const id = process.env.DIGIKEY_CLIENT_ID?.trim();
  const secret = process.env.DIGIKEY_CLIENT_SECRET?.trim();
  if (!id || !secret) return null;
  if (digikeyToken && digikeyToken.expiresAt > Date.now() + 30_000) return { token: digikeyToken.access, id };
  const result = await fetchJson("https://api.digikey.com/v1/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      grant_type: "client_credentials",
    }),
  });
  const token = (result.json as { access_token?: string; expires_in?: number } | null)?.access_token;
  const expiresIn = (result.json as { expires_in?: number } | null)?.expires_in ?? 600;
  if (!result.ok || !token) return null;
  digikeyToken = { access: token, expiresAt: Date.now() + expiresIn * 1000 };
  return { token, id };
}

async function lookupDigikey(keyword: string, usdKrw: number, updatedAt: string): Promise<SiteOffer> {
  const site = vendorById("digikey");
  const auth = await digikeyAccessToken();
  if (!auth) {
    return waitingOffer(
      site,
      keyword,
      "Digi-Key 검색 API 키가 있으면 검색 시 가격·재고가 갱신됩니다.",
      updatedAt,
      "키 필요",
    );
  }
  const result = await fetchJson("https://api.digikey.com/products/v4/search/keyword", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "X-DIGIKEY-Client-Id": auth.id,
      "X-DIGIKEY-Locale-Site": "KR",
      "X-DIGIKEY-Locale-Language": "ko",
      "X-DIGIKEY-Locale-Currency": "KRW",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ Keywords: keyword, RecordCount: 1 }),
  });
  const product = (result.json as { Products?: Record<string, unknown>[] } | null)?.Products?.[0];
  if (!result.ok || !product) {
    return {
      ...waitingOffer(site, keyword, "Digi-Key에서 이 품번을 찾지 못했습니다.", updatedAt),
      stockLabel: "검색결과 없음",
      source: "live",
    };
  }
  const qty = Number(product.QuantityAvailable ?? 0) || 0;
  const rawPrice = parseMoney(product.UnitPrice as number | string | undefined);
  const price = rawPrice ? (rawPrice < 500 ? toKrw(rawPrice, "USD", usdKrw) : Math.round(rawPrice)) : null;
  const stock = qty <= 0 ? "none" : qty < 10 ? "limited" : "in-stock";
  return {
    siteId: "digikey",
    siteName: site.name,
    region: site.region,
    kind: "reference",
    price,
    stock,
    stockLabel: qty <= 0 ? "품절" : stock === "limited" ? `소량 ${qty}개` : `재고 ${qty.toLocaleString("ko-KR")}개`,
    qty,
    leadTime: qty > 0 ? "재고" : "확인",
    available: qty > 0 && price !== null,
    note: "Digi-Key 검색 시점",
    href: String(product.ProductUrl || site.searchUrl(keyword)),
    source: "live",
    updatedAt,
    partNumber: String(product.ManufacturerProductNumber || keyword),
  };
}

export async function lookupOffers(item: OfferLookupItem, refresh = false): Promise<OfferLookupResult> {
  const keyword = lookupKeyword(item);
  const cacheKey = `${item.slug}:${keyword}`;
  const cache = await readCache();
  if (!refresh && cache[cacheKey] && cache[cacheKey].expiresAt > Date.now()) {
    return cache[cacheKey].result;
  }

  const updatedAt = new Date().toISOString();
  const usdKrw = await usdToKrw().catch(() => 1380);
  const [digikey, mouser] = await Promise.all([
    lookupDigikey(keyword, usdKrw, updatedAt).catch(() =>
      waitingOffer(vendorById("digikey"), keyword, "Digi-Key 조회에 실패했습니다.", updatedAt, "조회 실패"),
    ),
    lookupMouser(keyword, usdKrw, updatedAt).catch(() =>
      waitingOffer(vendorById("mouser"), keyword, "Mouser 조회에 실패했습니다.", updatedAt, "조회 실패"),
    ),
  ]);

  const result: OfferLookupResult = {
    slug: item.slug,
    keyword,
    updatedAt,
    offers: [localNe1Offer(item, updatedAt), digikey, mouser],
  };
  cache[cacheKey] = { expiresAt: Date.now() + CACHE_TTL_MS, result };
  await writeCache(cache);
  return result;
}
