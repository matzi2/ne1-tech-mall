"use client";

import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { pointsFromAmount, formatPoints } from "@/lib/points";

export default function CartPage() {
  const { cartLines, productTotal, updateQty, removeFromCart, user } = useApp();
  const earnable = user ? pointsFromAmount(productTotal) : 0;

  if (cartLines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">장바구니가 비어 있습니다.</h1>
        <p className="mt-2 text-slate-500">필요한 전자부품을 검색해 담거나 BOM으로 모은 뒤 주문하세요.</p>
        <Button asChild className="mt-6">
          <Link href="/products">제품몰 가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">장바구니</h1>
      <div className="mt-6 space-y-3">
        {cartLines.map((line) => (
          <div
            key={line.product.slug}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="flex-1">
              <Link href={`/products/${line.product.slug}`} className="font-semibold text-navy hover:underline">
                {line.product.name}
              </Link>
              <p className="text-sm text-slate-500">{line.product.sku}</p>
              <p className="mt-1 font-medium">{formatPrice(line.product.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                className="w-20"
                value={line.qty}
                onChange={(event) => updateQty(line.product.slug, Number(event.target.value) || 1)}
              />
              <Button variant="ghost" onClick={() => removeFromCart(line.product.slug)}>
                삭제
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <p className="text-lg font-bold text-navy">합계 {formatPrice(productTotal)}</p>
        <p className="mt-1 text-sm text-slate-500">
          {user
            ? `이 금액으로 결제하면 ${formatPoints(earnable)}가 적립됩니다.`
            : "로그인하면 결제 금액의 1%가 포인트로 적립됩니다."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/checkout">주문·결제</Link>
        </Button>
      </div>
    </div>
  );
}
