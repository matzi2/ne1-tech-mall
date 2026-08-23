"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ShopHero } from "@/components/shop-hero";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/app-providers";
import { company } from "@/lib/company";
import { categoryGroups } from "@/lib/products";
import { bestSellers, shopSteps, todayPicks } from "@/lib/shop";

export default function HomePage() {
  const { catalog, ready } = useApp();
  const picks = todayPicks(catalog);
  const best = bestSellers(catalog);

  return (
    <div>
      <ShopHero />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 text-sm">
          {shopSteps.map((step) => (
            <Link key={step.n} href={step.href} className="flex items-center gap-2 text-slate-700 hover:text-navy">
              <span className="grid size-6 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                {step.n}
              </span>
              {step.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#0046CA]">TODAY</p>
            <h2 className="mt-1 text-2xl font-bold text-navy">오늘 추천</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-[#0046CA]">
            전체 보기
          </Link>
        </div>
        {!ready ? (
          <p className="mt-6 text-sm text-slate-500">추천 상품을 불러오는 중입니다.</p>
        ) : picks.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">아직 추천 상품이 없습니다. 제품몰에서 품목을 확인해 주세요.</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {picks.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold text-navy">부품 구분</h2>
          <p className="mt-1 text-sm text-slate-500">대분류를 고르면 중분류까지 이어서 검색합니다.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoryGroups.map((item) => (
                <Link
                  key={item.id}
                  href={`/products?group=${item.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:border-[#0046CA]"
                >
                  <p className="font-semibold text-navy">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#0046CA]">BEST</p>
            <h2 className="mt-1 text-2xl font-bold text-navy">베스트 · 재고 상품</h2>
          </div>
          <Link href="/products?sort=stock" className="text-sm font-medium text-[#0046CA]">
            빠른 출고
          </Link>
        </div>
        {!ready ? (
          <p className="mt-6 text-sm text-slate-500">베스트 상품을 불러오는 중입니다.</p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {best.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-amber-300">고객센터</p>
            <p className="mt-1 text-2xl font-bold">
              {company.phone} · {company.phone2}
            </p>
            <p className="mt-1 text-sm text-white/70">
              {company.hours} · {company.email}
            </p>
          </div>
          <Button asChild variant="amber">
            <Link href="/inquiry">견적·재고 문의</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
