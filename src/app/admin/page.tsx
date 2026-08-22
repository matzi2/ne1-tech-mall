"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { ADMIN_EMAIL, isAdmin } from "@/lib/company";
import { formatPrice } from "@/lib/format";
import type { GitHubConnectState } from "@/lib/github-types";

export default function AdminOpsPage() {
  const { user, ready, orders, catalog, extras, users, confirmTransfer } = useApp();
  const [github, setGithub] = useState<GitHubConnectState | null>(null);

  useEffect(() => {
    fetch("/api/connect/github/status")
      .then((response) => response.json())
      .then((next: GitHubConnectState) => setGithub(next))
      .catch(() => undefined);
  }, []);

  if (!ready) return <div className="p-10 text-sm text-slate-500">운영화면을 불러오는 중입니다.</div>;

  if (!isAdmin(user)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">운영화면은 관리자만 봅니다.</h1>
        <p className="mt-2 text-sm text-slate-500">관리자 계정은 {ADMIN_EMAIL} 입니다.</p>
        <Button asChild className="mt-6">
          <Link href={`/login?next=/admin&email=${encodeURIComponent(ADMIN_EMAIL)}`}>이메일 로그인</Link>
        </Button>
      </div>
    );
  }

  const pending = orders.filter((order) => order.status === "pending-transfer");
  const paid = orders.filter((order) => order.status === "paid");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold tracking-wide text-amber-700">OPERATIONS</p>
      <h1 className="mt-1 text-3xl font-bold text-navy">운영화면</h1>
      <p className="mt-2 text-sm text-slate-600">
        {user?.name} · {user?.email}. 이 화면은 관리자 로그인 동안 상단 노란 막대에서 항상 열 수 있습니다.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">주문</p>
          <p className="mt-1 text-2xl font-bold text-navy">{orders.length}</p>
          <p className="mt-1 text-xs text-slate-500">입금 대기 {pending.length} · 결제 {paid.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">상품</p>
          <p className="mt-1 text-2xl font-bold text-navy">{catalog.length}</p>
          <p className="mt-1 text-xs text-slate-500">직접 등록 {extras.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">회원</p>
          <p className="mt-1 text-2xl font-bold text-navy">{users.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">GitHub</p>
          <p className="mt-1 text-lg font-bold text-navy">{github?.status === "published" ? "연결됨" : github?.status ?? "확인 중"}</p>
          {github?.repoHtmlUrl ? (
            <a className="mt-1 block truncate text-xs text-[#0046CA]" href={github.repoHtmlUrl}>
              {github.repoHtmlUrl}
            </a>
          ) : (
            <p className="mt-1 text-xs text-slate-500">{github?.login ?? "저장소 대기"}</p>
          )}
        </article>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">주문 확인</h2>
          <Button asChild size="sm">
            <Link href="/admin/products/new">상품 등록</Link>
          </Button>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">아직 주문이 없습니다. 쇼핑몰에서 주문이 들어오면 여기서 항상 확인합니다.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders
              .slice()
              .reverse()
              .map((order) => (
                <li key={order.id} className="rounded-xl border border-slate-100 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-slate-500">
                        {order.buyerName} · {order.paymentMethod === "card" ? "카드" : "송금"} ·{" "}
                        {order.status === "paid" ? "결제 완료" : "입금 대기"} · {formatPrice(order.payable)}
                      </p>
                    </div>
                    {order.status === "pending-transfer" ? (
                      <Button size="sm" onClick={() => confirmTransfer(order.id)}>
                        입금 확인
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
