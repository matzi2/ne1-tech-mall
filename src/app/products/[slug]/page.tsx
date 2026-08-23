"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useApp } from "@/components/app-providers";
import { ProductVisual } from "@/components/product-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize, formatPrice } from "@/lib/format";
import { useCompare } from "@/components/compare-provider";
import { getCategoryGroup, getCategoryLabel } from "@/lib/products";
import { useBom } from "@/components/bom-provider";
import { alternativeProducts } from "@/lib/bom";
import { relatedProducts } from "@/lib/shop";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { catalog, getProduct, addToCart, ready } = useApp();
  const compare = useCompare();
  const bom = useBom();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const product = getProduct(slug);
  const related = product ? relatedProducts(catalog, product.slug, product.category) : [];
  const alternatives = product ? alternativeProducts(catalog, product) : [];

  if (!ready) {
    return <div className="p-10 text-sm text-slate-500">상품을 불러오는 중입니다.</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">상품을 찾지 못했습니다.</h1>
        <p className="mt-2 text-slate-500">검색으로 다시 찾아보거나 제품몰로 돌아가 주세요.</p>
        <Button asChild className="mt-6">
          <Link href="/products">제품몰</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="aspect-[4/3]">
          <ProductVisual product={product} />
        </div>
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          {getCategoryGroup(product.category) ? (
            <Badge variant="muted">{getCategoryGroup(product.category)?.label}</Badge>
          ) : null}
          <Badge>{getCategoryLabel(product.category)}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-navy">{product.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{product.sku} · {product.leadTime}</p>
        <p className="mt-4 text-3xl font-bold text-navy">{formatPrice(product.price)}</p>
        <p className="mt-4 leading-7 text-slate-600">{product.description}</p>
        <div className="mt-6 flex items-center gap-3">
          <Input
            type="number"
            min={1}
            value={qty}
            onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
            className="w-24"
          />
          <Button
            onClick={() => {
              addToCart(product.slug, qty);
              router.push("/cart");
            }}
          >
            장바구니 담기
          </Button>
          <Button
            variant="navy"
            onClick={() => {
              addToCart(product.slug, qty);
              router.push("/checkout");
            }}
          >
            바로 주문
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              bom.add(product.slug, qty);
              setNote(`BOM에 ${qty}개 넣었습니다.`);
            }}
          >
            {bom.has(product.slug) ? `BOM ${bom.qtyOf(product.slug)}` : "BOM에 넣기"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/inquiry">견적 문의</Link>
          </Button>
          <Button type="button" variant={compare.has(product.slug) ? "outline" : "amber"} onClick={() => compare.toggle(product.slug)}>
            {compare.has(product.slug) ? "비교에서 빼기" : "스펙 비교"}
          </Button>
        </div>
        {note ? (
          <p className="mt-3 text-sm text-sky-700">
            {note}{" "}
            <Link href="/bom" className="underline">
              BOM 보기
            </Link>
          </p>
        ) : null}
        {product.specs.length > 0 ? (
          <dl className="mt-8 divide-y rounded-xl border border-slate-200 bg-white">
            {product.specs.map((spec) => (
              <div key={spec.label} className="grid grid-cols-2 px-4 py-3 text-sm">
                <dt className="text-slate-500">{spec.label}</dt>
                <dd className="font-medium text-navy">{spec.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {product.documents.length > 0 ? (
          <div className="mt-6">
            <h2 className="font-semibold text-navy">첨부 문서</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {product.documents.map((doc) => (
                <li key={doc.id}>
                  <a href={doc.dataUrl} download={doc.name} className="text-sky-700 hover:underline">
                    {doc.name} ({formatFileSize(doc.size)})
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      {alternatives.length ? (
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-navy">대체품</h2>
          <p className="mt-1 text-sm text-slate-500">같은 품목·분류에서 대신 쓸 수 있는 부품입니다.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alternatives.map((item) => (
              <div key={item.slug} className="space-y-2">
                <ProductCard product={item} />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    bom.add(item.slug, 1);
                    setNote(`${item.sku}를 대체품으로 BOM에 넣었습니다.`);
                  }}
                >
                  대체로 BOM에 넣기
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : related.length ? (
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-navy">같은 품목</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
