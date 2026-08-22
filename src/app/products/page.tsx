"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SiteSearch } from "@/components/site-search";
import { useApp } from "@/components/app-providers";
import { filterCatalog } from "@/lib/catalog";
import { categories, type ProductCategory } from "@/lib/products";
import { Suspense } from "react";

function ProductsBody() {
  const params = useSearchParams();
  const router = useRouter();
  const { catalog, ready } = useApp();
  const q = params.get("q") ?? "";
  const category = (params.get("category") as ProductCategory | "all") || "all";
  const results = useMemo(
    () => filterCatalog(catalog, q, category === "all" || !category ? "all" : category),
    [catalog, category, q],
  );

  function setCategory(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next === "all") sp.delete("category");
    else sp.set("category", next);
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
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              (item.id === "all" && (!category || category === "all")) || item.id === category
                ? "border-navy bg-navy text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        {q ? `“${q}” 검색 결과 ` : "전체 "}
        {ready ? `${results.length}건` : "불러오는 중"}
      </p>
      {ready && results.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-navy">검색 결과가 없습니다.</p>
          <p className="mt-2 text-sm text-slate-500">
            다른 키워드를 치거나 카테고리를 바꿔 보세요. 관리자는 파일·사진·문서로 상품을 등록할 수 있습니다.
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
