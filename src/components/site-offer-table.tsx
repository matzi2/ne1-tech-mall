"use client";

import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CatalogProduct } from "@/lib/catalog";
import { cheapestOffer, formatOfferPrice, lookupKeyword, offersForProduct } from "@/lib/site-offers";
import { cn } from "@/lib/utils";

export function SiteOfferTable({
  product,
  compact = false,
}: {
  product: CatalogProduct;
  compact?: boolean;
}) {
  const { addToCart } = useApp();
  const offers = offersForProduct(product);
  const cheap = cheapestOffer(offers);
  const keyword = lookupKeyword(product);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      {!compact ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
          <p className="text-sm font-semibold text-navy">
            {product.sku} · 사이트별 가격·재고
          </p>
          <p className="text-xs text-slate-500">조회 키워드 {keyword}</p>
        </div>
      ) : null}
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
                className={cn("border-t border-slate-100", offer.kind === "self" && "bg-sky-50/70", lowest && "bg-amber-50")}
              >
                <td className="px-3 py-2">
                  <p className="font-semibold text-navy">{offer.siteName}</p>
                  <p className="text-[11px] text-slate-400">{offer.region}</p>
                </td>
                <td className="px-3 py-2 font-semibold text-navy">
                  {formatOfferPrice(offer.price, offer.stock)}
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
                        사이트
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
        {companyNote()}{" "}
        <Link href={`/products/${product.slug}`} className="text-[#0046CA] hover:underline">
          이 몰 상세
        </Link>
      </p>
    </div>
  );
}

function companyNote() {
  return "이 몰 가격은 실시간입니다. 다른 사이트는 품번 기준 참고 시세이며 재고가 달라질 수 있습니다.";
}
