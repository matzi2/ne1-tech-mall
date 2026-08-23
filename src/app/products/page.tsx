"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Table2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductTable } from "@/components/product-table";
import { SiteSearch } from "@/components/site-search";
import { useApp } from "@/components/app-providers";
import { categoryGroups, getCategoryGroup, matchTaxonomy, type CategoryGroupId, type ProductCategory } from "@/lib/products";
import { shopSorts, sortCatalog, type ShopSort } from "@/lib/shop";
import { looksConversational, parseSearchIntent, searchWithIntent, type SearchIntent } from "@/lib/smart-search";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

function ProductsBody() {
  const params = useSearchParams();
  const router = useRouter();
  const { catalog, ready } = useApp();
  const q = params.get("q") ?? "";
  const category = (params.get("category") as ProductCategory | "all") || "all";
  const group = (params.get("group") as CategoryGroupId | "all") || "all";
  const sort = (params.get("sort") as ShopSort) || "featured";
  const view = params.get("view") === "table" ? "table" : "card";
  const localIntent = useMemo(() => parseSearchIntent(q), [q]);
  const [remoteIntent, setRemoteIntent] = useState<SearchIntent | null>(null);
  const [searchSource, setSearchSource] = useState<"local" | "llm">("local");

  useEffect(() => {
    setRemoteIntent(null);
    setSearchSource("local");
    if (!looksConversational(q)) return;
    const controller = new AbortController();
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: { source?: "local" | "llm"; intent?: SearchIntent }) => {
        if (data.source === "llm" && data.intent) {
          setRemoteIntent(data.intent);
          setSearchSource("llm");
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [q]);

  const intent = remoteIntent ?? localIntent;
  const results = useMemo(() => {
    const filtered = searchWithIntent(catalog, intent).filter((item) =>
      matchTaxonomy(item.category, group, category),
    );
    return sortCatalog(filtered, shopSorts.some((item) => item.id === sort) ? sort : "featured");
  }, [catalog, category, group, intent, sort]);

  function setCategory(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next === "all") {
      sp.delete("category");
      sp.delete("group");
    } else {
      sp.set("category", next);
      const parent = getCategoryGroup(next as ProductCategory);
      if (parent) sp.set("group", parent.id);
    }
    router.push(`/products?${sp.toString()}`);
  }

  function setSort(next: ShopSort) {
    const sp = new URLSearchParams(params.toString());
    if (next === "featured") sp.delete("sort");
    else sp.set("sort", next);
    router.push(`/products?${sp.toString()}`);
  }

  function setView(next: "card" | "table") {
    const sp = new URLSearchParams(params.toString());
    if (next === "card") sp.delete("view");
    else sp.set("view", "table");
    router.push(`/products?${sp.toString()}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">제품몰</h1>
      <p className="mt-1 text-sm text-slate-500">
        품번뿐 아니라 “3극 100A 차단기”, “재고 있는 24V 전원”처럼 말로 찾아도 됩니다.
      </p>
      <div className="mt-5 max-w-xl">
        <SiteSearch initialQuery={q} />
      </div>
      {q ? (
        <p className="mt-3 text-sm text-sky-800">
          {searchSource === "llm" ? "모델 해석" : "스마트 해석"} · {intent.summary || q}
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-400">예: 온습도센서 · 10k 저항 · 누전 30mA</p>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            group === "all" && (category === "all" || !category)
              ? "border-navy bg-navy text-white"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          전체
        </button>
        {categoryGroups.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              const sp = new URLSearchParams(params.toString());
              sp.delete("category");
              sp.set("group", item.id);
              router.push(`/products?${sp.toString()}`);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              group === item.id ? "border-navy bg-navy text-white" : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {q ? `“${q}” 검색 결과 ` : "전체 "}
          {ready ? `${results.length}건` : "불러오는 중"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 flex rounded-full border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView("card")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
                view === "card" ? "bg-navy text-white" : "text-slate-600",
              )}
            >
              <LayoutGrid className="size-3.5" />
              카드
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
                view === "table" ? "bg-navy text-white" : "text-slate-600",
              )}
            >
              <Table2 className="size-3.5" />
              표
            </button>
          </div>
          {shopSorts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSort(item.id)}
              className={`rounded-full px-3 py-1 text-xs ${
                item.id === sort || (item.id === "featured" && !params.get("sort"))
                  ? "bg-navy text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {ready && results.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-navy">검색 결과가 없습니다.</p>
          <p className="mt-2 text-sm text-slate-500">
            다른 키워드를 치거나 카테고리를 바꿔 보세요. 찾는 품목이 없으면 견적·문의로 남겨 주세요.
          </p>
        </div>
      ) : (
        view === "table" ? (
          <ProductTable products={results} />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">상품을 불러오는 중입니다.</div>}>
      <ProductsBody />
    </Suspense>
  );
}
