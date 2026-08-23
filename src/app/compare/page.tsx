"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { useCompare } from "@/components/compare-provider";
import { ProductVisual } from "@/components/product-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildCompareRows, cheapestSlug, COMPARE_MAX, parseCompareSlugs, stockLabel } from "@/lib/compare";
import { formatPrice } from "@/lib/format";
import { categoryGroups, categoriesInGroup, getCategoryLabel, type ProductCategory } from "@/lib/products";
import {
  applySpecFilters,
  brandOf,
  defaultSpecFilters,
  priceBands,
  specFacets,
  stockFilters,
  type PriceBand,
  type SpecSearchFilters,
  type StockFilter,
} from "@/lib/spec-search";
import { cn } from "@/lib/utils";

function CompareBody() {
  const params = useSearchParams();
  const router = useRouter();
  const { catalog, addToCart, ready } = useApp();
  const compare = useCompare();
  const [filters, setFilters] = useState<SpecSearchFilters>({
    ...defaultSpecFilters,
    query: params.get("q") ?? "",
    category: (params.get("category") as ProductCategory | "all") || "all",
  });

  useEffect(() => {
    const fromUrl = parseCompareSlugs(params.get("slugs"));
    if (fromUrl.length) compare.replace(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL 초기값만
  }, []);

  const scoped = useMemo(
    () => applySpecFilters(catalog, { ...filters, specs: {}, stock: "all", priceBand: "all" }),
    [catalog, filters.category, filters.group, filters.query],
  );
  const facets = useMemo(() => specFacets(scoped), [scoped]);
  const results = useMemo(() => applySpecFilters(catalog, filters), [catalog, filters]);
  const selected = useMemo(
    () =>
      compare.slugs
        .map((slug) => catalog.find((item) => item.slug === slug))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [catalog, compare.slugs],
  );
  const rows = useMemo(() => buildCompareRows(selected), [selected]);
  const cheap = cheapestSlug(selected);

  function setCategory(next: ProductCategory | "all") {
    setFilters({ ...filters, category: next, specs: {} });
  }

  if (!ready) {
    return <p className="p-10 text-sm text-slate-500">스펙서치 목록을 불러오는 중입니다.</p>;
  }

  return (
    <div className="bg-slate-100">
      <div className="border-b border-slate-200 bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-xs font-semibold tracking-wide text-amber-300">SPEC SEARCH</p>
          <h1 className="mt-1 text-3xl font-bold">스펙서치 · 부품 비교</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75">
            아이씨뱅큐 스펙서치·디바이스마트 품번 검색처럼, 품번·정격으로 찾고 사양을 표로 맞춰 봅니다. 비교는{" "}
            {COMPARE_MAX}개까지입니다.
          </p>
          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <Input
              value={filters.query}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="품번, 정격, 제품명 — 예: MCCB 100A, 24V 10A, NE1-ELCB"
              aria-label="부품 품번 검색"
              className="h-12 border-0 bg-white text-slate-900 sm:flex-1"
            />
            <Button type="button" variant="amber" className="h-12" onClick={() => setFilters({ ...filters, query: "" })}>
              검색 초기화
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold tracking-wide text-slate-400">필터</p>
          <div className="mt-3 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">대분류</p>
              <div className="mt-2 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, group: "all", category: "all", specs: {} })}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-left text-sm",
                    filters.group === "all" && filters.category === "all" ? "bg-navy text-white" : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  전체
                </button>
                {categoryGroups.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilters({ ...filters, group: item.id, category: "all", specs: {} })}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-left text-sm",
                      filters.group === item.id ? "bg-navy text-white" : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {filters.group !== "all" ? (
              <div>
                <p className="text-xs font-semibold text-slate-500">중분류</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {categoriesInGroup(filters.group).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as ProductCategory)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs",
                        filters.category === item.id ? "bg-navy text-white" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold text-slate-500">가격대</p>
              <div className="mt-2 flex flex-col gap-1">
                {priceBands.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilters({ ...filters, priceBand: item.id as PriceBand })}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-left text-sm",
                      filters.priceBand === item.id ? "bg-navy text-white" : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">재고</p>
              <div className="mt-2 flex flex-col gap-1">
                {stockFilters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilters({ ...filters, stock: item.id as StockFilter })}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-left text-sm",
                      filters.stock === item.id ? "bg-navy text-white" : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {facets.map((facet) => (
              <div key={facet.label}>
                <p className="text-xs font-semibold text-slate-500">{facet.label}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...filters.specs };
                      delete next[facet.label];
                      setFilters({ ...filters, specs: next });
                    }}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs",
                      !filters.specs[facet.label] ? "bg-navy text-white" : "bg-slate-100 text-slate-600",
                    )}
                  >
                    전체
                  </button>
                  {facet.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilters({ ...filters, specs: { ...filters.specs, [facet.label]: value } })}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs",
                        filters.specs[facet.label] === value ? "bg-navy text-white" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setFilters(defaultSpecFilters)}
            >
              필터 모두 지우기
            </Button>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-navy">검색 결과</h2>
              <p className="text-sm text-slate-500">
                {results.length}건 · 브랜드 {brandOf(results[0] ?? catalog[0])} · 체크 후 아래에서 사양 비교
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/products">카드형 제품몰</Link>
            </Button>
          </div>

          {compare.message ? <p className="mt-3 text-sm text-amber-800">{compare.message}</p> : null}

          {results.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold text-navy">조건에 맞는 부품이 없습니다.</p>
              <p className="mt-2 text-sm text-slate-500">품번을 줄이거나 필터를 지워 보세요. 없으면 견적·문의로 남겨 주세요.</p>
              <Button asChild className="mt-5">
                <Link href="/inquiry">견적·문의</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-[880px] w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">비교</th>
                    <th className="px-3 py-2">품번</th>
                    <th className="px-3 py-2">품명 / 사양</th>
                    <th className="px-3 py-2">재고</th>
                    <th className="px-3 py-2">납기</th>
                    <th className="px-3 py-2">가격</th>
                    <th className="px-3 py-2">주문</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => {
                    const on = compare.has(item.slug);
                    return (
                      <tr key={item.slug} className={cn("border-t border-slate-100", on && "bg-amber-50/60")}>
                        <td className="px-3 py-3">
                          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                            <input type="checkbox" checked={on} onChange={() => compare.toggle(item.slug)} />
                            비교
                          </label>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs font-semibold text-[#0046CA]">{item.sku}</td>
                        <td className="px-3 py-3">
                          <Link href={`/products/${item.slug}`} className="font-semibold text-navy hover:text-sky-700">
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {getCategoryLabel(item.category)} · {item.specs.map((spec) => spec.value).slice(0, 3).join(" / ")}
                          </p>
                        </td>
                        <td className="px-3 py-3">{stockLabel(item.stock)}</td>
                        <td className="px-3 py-3 text-slate-600">{item.leadTime}</td>
                        <td className="px-3 py-3 font-bold text-navy">{formatPrice(item.price)}</td>
                        <td className="px-3 py-3">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              addToCart(item.slug, 1);
                              router.push("/cart");
                            }}
                          >
                            담기
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-navy">선택 부품 사양 비교</h2>
                <p className="text-sm text-slate-500">
                  {selected.length}개 선택 · 다른 값은 노란 칸 · {COMPARE_MAX}개까지
                </p>
              </div>
              {selected.length ? (
                <Button type="button" variant="outline" size="sm" onClick={compare.clear}>
                  선택 비우기
                </Button>
              ) : null}
            </div>

            {selected.length < 2 ? (
              <p className="mt-6 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                {selected.length === 0
                  ? "위 표에서 비교 체크를 2개 이상 하면 사양·가격·재고가 한 표로 맞춰집니다."
                  : "한 개 더 체크하면 사양 비교표가 열립니다."}
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-[720px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 align-top">
                      <th className="sticky left-0 z-10 w-24 bg-slate-50 px-3 py-3 text-left text-xs text-slate-500">항목</th>
                      {selected.map((item) => (
                        <th key={item.slug} className="min-w-[170px] px-3 py-3 text-left">
                          <div className="overflow-hidden rounded-lg bg-slate-100">
                            <div className="aspect-[4/3]">
                              <ProductVisual product={item} />
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cheap === item.slug ? <Badge variant="amber">더 낮은 가격</Badge> : null}
                            <Badge variant="outline">{stockLabel(item.stock)}</Badge>
                          </div>
                          <Link href={`/products/${item.slug}`} className="mt-2 block font-bold text-navy hover:text-sky-700">
                            {item.name}
                          </Link>
                          <p className="font-mono text-xs text-slate-500">{item.sku}</p>
                          <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => compare.remove(item.slug)}>
                            빼기
                          </Button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key} className="border-b border-slate-100">
                        <th className="sticky left-0 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-500">
                          {row.label}
                        </th>
                        {row.values.map((value, index) => (
                          <td
                            key={`${row.key}-${selected[index].slug}`}
                            className={cn("px-3 py-2 font-medium text-navy", row.differs && "bg-amber-50")}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-slate-500">노란 칸은 서로 다른 값입니다.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<p className="p-10 text-sm text-slate-500">스펙서치를 여는 중입니다.</p>}>
      <CompareBody />
    </Suspense>
  );
}
