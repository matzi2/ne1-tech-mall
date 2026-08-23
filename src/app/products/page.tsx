"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SiteSearch } from "@/components/site-search";
import { useApp } from "@/components/app-providers";
import { filterCatalog } from "@/lib/catalog";
import { categoryGroups, getCategoryGroup, matchTaxonomy, type CategoryGroupId, type ProductCategory } from "@/lib/products";
import { shopSorts, sortCatalog, type ShopSort } from "@/lib/shop";
import { Suspense } from "react";

function ProductsBody() {
  const params = useSearchParams();
  const router = useRouter();
  const { catalog, ready } = useApp();
  const q = params.get("q") ?? "";
  const category = (params.get("category") as ProductCategory | "all") || "all";
  const group = (params.get("group") as CategoryGroupId | "all") || "all";
  const sort = (params.get("sort") as ShopSort) || "featured";
  const results = useMemo(() => {
    const filtered = filterCatalog(catalog, q).filter((item) => matchTaxonomy(item.category, group, category));
    return sortCatalog(filtered, shopSorts.some((item) => item.id === sort) ? sort : "featured");
  }, [catalog, category, group, q, sort]);

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">제품몰</h1>
      <p className="mt-1 text-sm text-slate-500">
        품번, 제품명, 사양, 첨부 파일명으로 검색할 수 있습니다.
      </p>
      <div className="mt-5 max-w-xl">
        <SiteSearch initialQuery={q} />
      </div>
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
        <div className="flex flex-wrap gap-2">
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
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
