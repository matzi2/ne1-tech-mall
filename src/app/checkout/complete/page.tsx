"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/format";
import { formatPoints } from "@/lib/points";

function CompleteBody() {
  const params = useSearchParams();
  const { orders, confirmTransfer, user } = useApp();
  const order = orders.find((item) => item.id === params.get("order"));

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">주문 정보를 찾지 못했습니다.</h1>
        <Button asChild className="mt-6">
          <Link href="/mypage">마이페이지</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">주문이 접수되었습니다.</h1>
      <p className="mt-2 text-slate-600">주문번호 {order.id}</p>
      <div className="mt-6 space-y-2 rounded-xl border border-slate-200 bg-white p-5 text-sm">
        <p>결제 수단: {order.paymentMethod === "card" ? `카드 (끝 ${order.cardLast4})` : "무통장 송금"}</p>
        <p>상태: {order.status === "paid" ? "결제 완료" : "입금 대기"}</p>
        <p>결제 금액: {formatPrice(order.payable)}</p>
        {order.pointsEarned > 0 ? (
          <p>
            적립 포인트: {formatPoints(order.pointsEarned)}
            {order.status === "pending-transfer" ? " (입금 확인 후 지급)" : " 지급 완료"}
          </p>
        ) : null}
        {order.paymentMethod === "transfer" ? (
          <p className="pt-2">
            {company.bank.name} {company.bank.account} (예금주 {company.bank.holder})
            <br />
            입금자명: {order.depositor}
          </p>
        ) : null}
      </div>
      {order.status === "pending-transfer" && user ? (
        <Button className="mt-4" variant="outline" onClick={() => confirmTransfer(order.id)}>
          입금 완료 알리기
        </Button>
      ) : null}
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/mypage">주문 내역</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">계속 쇼핑</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">주문 결과를 불러오는 중입니다.</div>}>
      <CompleteBody />
    </Suspense>
  );
}
