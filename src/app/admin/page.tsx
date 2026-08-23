"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { company, isAdmin } from "@/lib/company";
import { releases } from "@/lib/releases";
import { formatPrice } from "@/lib/format";
import { inquiryStatusLabel, inquiryTotal } from "@/lib/inquiries";
import { daysUntil, formatMemberDate } from "@/lib/membership";
import { domainPlan } from "@/lib/dns";
import { GitHubWindows } from "@/components/github-windows";
import type { GitHubConnectState } from "@/lib/github-types";

type DomainStatus = {
  live: boolean;
  message: string;
};

export default function AdminOpsPage() {
  const { user, ready, orders, catalog, extras, users, inquiries, confirmTransfer, updateInquiryStatus, purgeExpiredAccounts } = useApp();
  const [github, setGithub] = useState<GitHubConnectState | null>(null);
  const [domain, setDomain] = useState<DomainStatus | null>(null);

  useEffect(() => {
    fetch("/api/connect/github/status")
      .then((response) => response.json())
      .then((next: GitHubConnectState) => setGithub(next))
      .catch(() => undefined);
    fetch("/api/connect/domain/status")
      .then((response) => response.json())
      .then((next: DomainStatus) => setDomain(next))
      .catch(() => undefined);
  }, []);

  if (!ready) return <div className="p-10 text-sm text-slate-500">운영화면을 불러오는 중입니다.</div>;

  if (!isAdmin(user)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">운영화면은 관리자만 봅니다.</h1>
        <p className="mt-2 text-sm text-slate-500">관리자 이메일로 로그인한 뒤에만 엽니다.</p>
        <Button asChild className="mt-6">
          <Link href="/login?next=/admin">이메일 로그인</Link>
        </Button>
      </div>
    );
  }

  const pending = orders.filter((order) => order.status === "pending-transfer");
  const paid = orders.filter((order) => order.status === "paid");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold tracking-wide text-amber-700">OPERATIONS · v{company.version}</p>
      <h1 className="mt-1 text-3xl font-bold text-navy">운영화면</h1>
      <p className="mt-2 text-sm text-slate-600">
        {user?.name} · {user?.email}. 배포 {company.releasedAt} · 이 화면은 상단 노란 막대에서 항상 열 수 있습니다.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
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
          <p className="mt-1 text-2xl font-bold text-navy">{users.filter((item) => item.status !== "withdrawn").length}</p>
          <p className="mt-1 text-xs text-slate-500">탈퇴 대기 {users.filter((item) => item.status === "withdrawn").length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">견적·문의</p>
          <p className="mt-1 text-2xl font-bold text-navy">{inquiries.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            접수 {inquiries.filter((item) => item.status === "received").length} · 검토{" "}
            {inquiries.filter((item) => item.status === "reviewing").length}
          </p>
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
          <Link href="/admin/github" className="mt-2 inline-block text-xs font-semibold text-[#0046CA] underline">
            GitHub 로그인 창
          </Link>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs text-slate-500">도메인</p>
          <p className="mt-1 text-lg font-bold text-navy">{domain?.live ? "A 확인됨" : "www·_dmarc 반영"}</p>
          <p className="mt-1 text-xs text-slate-500">{domainPlan.apex}</p>
          <p className="mt-1 text-xs text-slate-500">공식 도메인 상태만 표시합니다.</p>
        </article>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-navy">GitHub 로그인 · 토큰 정보</h2>
            <p className="text-sm text-slate-500">로그인 창과 토큰 정보 창을 따로 둡니다. 쇼핑몰 화면에는 없습니다.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/github">창만 크게 보기</Link>
          </Button>
        </div>
        <GitHubWindows />
      </section>

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

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">탈퇴 대기</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void fetch("/api/auth/membership", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "purge" }),
              }).then(() => purgeExpiredAccounts());
            }}
          >
            만료분 삭제
          </Button>
        </div>
        {users.filter((item) => item.status === "withdrawn").length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">탈퇴 대기 회원이 없습니다. 보관 기간이 끝나면 여기서 삭제합니다.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {users
              .filter((item) => item.status === "withdrawn")
              .map((item) => (
                <li key={item.email} className="rounded-xl border border-slate-100 px-4 py-3">
                  <p className="font-semibold">{item.name} · {item.email}</p>
                  <p className="text-xs text-slate-500">
                    {formatMemberDate(item.purgeAt)} 삭제 · {daysUntil(item.purgeAt)}일 남음
                  </p>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-navy">견적·문의</h2>
        {inquiries.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">접수된 문의가 없습니다. 쇼핑몰 견적·문의나 BOM에서 오면 여기에 모입니다.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {inquiries.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-100 p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {item.id} · {inquiryStatusLabel[item.status]}
                    </p>
                    <p className="text-slate-500">
                      {item.name} · {item.email} · {item.phone}
                      {item.companyName ? ` · ${item.companyName}` : ""}
                    </p>
                    <p className="mt-2 text-slate-700">{item.body}</p>
                    {item.items.length ? (
                      <ul className="mt-2 space-y-1 text-xs text-slate-500">
                        {item.items.map((line) => (
                          <li key={`${item.id}-${line.slug}`}>
                            {line.sku} · {line.name} × {line.qty} · {formatPrice(line.unitPrice)}
                          </li>
                        ))}
                        <li>참고 합계 {formatPrice(inquiryTotal(item.items))}</li>
                      </ul>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.status === "received" ? (
                      <Button size="sm" variant="outline" onClick={() => updateInquiryStatus(item.id, "reviewing")}>
                        검토 중
                      </Button>
                    ) : null}
                    {item.status !== "quoted" ? (
                      <Button size="sm" onClick={() => updateInquiryStatus(item.id, "quoted")}>
                        견적 회신
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-navy">버전 히스토리</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/history">전체 보기</Link>
          </Button>
        </div>
        <ul className="mt-4 space-y-3 text-sm">
          {releases.slice(0, 3).map((release) => (
            <li key={release.version}>
              <p className="font-semibold text-navy">
                v{release.version} · {release.date}
              </p>
              <p className="text-slate-600">{release.title}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
