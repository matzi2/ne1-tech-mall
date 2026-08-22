"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SiteSearch } from "@/components/site-search";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/app-providers";
import { company, capabilities } from "@/lib/company";
import { categories } from "@/lib/products";

export default function HomePage() {
  const { catalog } = useApp();
  const featured = catalog.filter((item) => item.featured).slice(0, 8);

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-sky-300">
              {company.domain}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
              {company.nameKo} 전자부품 쇼핑몰
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
              {company.tagline} 차단기, 접촉기, 전원장치, 단자대를 품목별로 검색하고 송금 또는 카드로 주문하세요. 회원 구매 시 결제금액의 1%가 포인트로 적립됩니다.
            </p>
            <div className="mt-6 max-w-lg">
              <SiteSearch />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="amber">
                <Link href="/products">제품 둘러보기</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link href="/login">로그인하고 포인트 적립</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm leading-7">
            <p className="font-semibold text-sky-200">v{company.version}에서 가능한 일</p>
            <p>상품명·품번·사양 검색</p>
            <p>파일·사진·문서로 상품 등록</p>
            <p>무통장 송금 / 신용·체크카드 결제</p>
            <p>회원 구매 시 포인트 적립·사용</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-bold text-navy">품목 분류</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories
            .filter((item) => item.id !== "all")
            .map((item) => (
              <Link
                key={item.id}
                href={`/products?category=${item.id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:border-sky-400"
              >
                <p className="font-semibold text-navy">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </Link>
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold text-navy">추천 제품</h2>
          <Link href="/products" className="text-sm font-medium text-sky-700">
            전체 보기
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-4">
          {capabilities.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
