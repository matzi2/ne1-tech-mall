"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogProduct } from "@/lib/catalog";
import {
  cheapestOffer,
  formatOfferPrice,
  formatOfferTime,
  lookupKeyword,
  placeholderOffers,
  toLookupItem,
  type OfferLookupResult,
  type SiteOffer,
} from "@/lib/site-offers";
import { cn } from "@/lib/utils";

export function SiteOfferTable({
  product,
  compact = false,
  searchToken = "",
}: {
  product: CatalogProduct;
  compact?: boolean;
  searchToken?: string;
}) {
  const { addToCart } = useApp();
  const [offers, setOffers] = useState<SiteOffer[]>(() => placeholderOffers(product));
  const [updatedAt, setUpdatedAt] = useState("");
  const [busy, setBusy] = useState(false);
  const keyword = lookupKeyword(product);
  const cheap = cheapestOffer(offers);

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setOffers(placeholderOffers(product));
    fetch("/api/offers/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ items: [toLookupItem(product)], refresh: Boolean(searchToken) }),
    })
      .then((response) => response.json())
      .then((data: { results?: OfferLookupResult[] }) => {
        const row = data.results?.[0];
        if (row?.offers?.length) {
          setOffers(row.offers);
          setUpdatedAt(row.updatedAt);
        }
      })
      .catch(() => undefined)
      .finally(() => setBusy(false));
    return () => controller.abort();
  }, [product.slug, product.sku, product.price, product.stock, searchToken]);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <p className="text-sm font-semibold text-navy">
          {compact ? "Digi-Key · Mouser 기준" : `${product.sku} · Digi-Key · Mouser 기준`}
        </p>
        <p className="text-xs text-slate-500">
          조회 {keyword}
          {updatedAt ? ` · ${formatOfferTime(updatedAt)} 검색` : busy ? " · 검색 중" : ""}
        </p>
      </div>
      <table className="min-w-[640px] w-full text-left text-sm">
        <thead className="bg-white text-xs text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">사이트</th>
            <th className="px-3 py-2 font-medium">가격</th>
            <th className="px-3 py-2 font-medium">재고</th>
            <th className="px-3 py-2 font-medium">납기</th>
            <th className="px-3 py-2 font-medium">비고</th>
            <th className="px-3 py-2 font-medium">바로가기</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const lowest = cheap?.siteId === offer.siteId;
            return (
              <tr
                key={offer.siteId}
                className={cn(
                  "border-t border-slate-100",
                  offer.kind === "self" && "bg-sky-50/70",
                  lowest && "bg-amber-50",
                )}
              >
                <td className="px-3 py-2">
                  <p className="font-semibold text-navy">{offer.siteName}</p>
                  <p className="text-[11px] text-slate-400">{offer.region}</p>
                </td>
                <td className="px-3 py-2 font-semibold text-navy">
                  {formatOfferPrice(offer)}
                  {lowest ? (
                    <Badge variant="amber" className="ml-2">
                      더 낮음
                    </Badge>
                  ) : null}
                </td>
                <td className="px-3 py-2">{offer.stockLabel}</td>
                <td className="px-3 py-2 text-slate-600">{offer.leadTime}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{offer.note}</td>
                <td className="px-3 py-2">
                  {offer.kind === "self" ? (
                    <Button size="sm" onClick={() => addToCart(product.slug, 1)}>
                      담기
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <a href={offer.href} target="_blank" rel="noreferrer">
                        {offer.siteName}
                      </a>
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[11px] text-slate-400">
        비교 기준은 Digi-Key와 Mouser입니다. 검색할 때마다 다시 조회합니다. API 키가 있으면 가격·재고가 숫자로
        갱신되고, 없으면 해당 사이트 검색으로 확인합니다.{" "}
        <Link href={`/products/${product.slug}`} className="text-[#0046CA] hover:underline">
          이 몰 상세
        </Link>
      </p>
    </div>
  );
}
