"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/company";
import { formatPrice } from "@/lib/format";
import { inquiryStatusLabel, inquiryTotal } from "@/lib/inquiries";
import { daysUntil, formatMemberDate } from "@/lib/membership";
import { formatPoints } from "@/lib/points";

export default function MyPage() {
  const router = useRouter();
  const { user, logout, orders, points, inquiries, pointBalance, confirmTransfer, ready } = useApp();

  if (!ready) return <div className="p-10 text-sm text-slate-500">불러오는 중입니다.</div>;

  if (!user) {
    router.replace("/login?next=/mypage");
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p>로그인 화면으로 이동합니다.</p>
        <Button asChild className="mt-4">
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    );
  }

  const myOrders = orders.filter((order) => order.email === user.email);
  const myPoints = [...points].filter((entry) => entry.email === user.email).reverse();
  const myInquiries = inquiries.filter((item) => item.email === user.email);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{user.name} 님</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin(user) ? (
            <>
              <Button asChild variant="amber">
                <Link href="/admin">운영화면</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/github">GitHub</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/nas">NAS</Link>
              </Button>
            </>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/account">가입·탈퇴</Link>
          </Button>
          <Button variant="outline" onClick={logout}>
            로그아웃
          </Button>
        </div>
      </div>
      {user.status === "withdrawn" ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-navy">탈퇴 대기 중입니다.</p>
          <p className="mt-1 text-sm text-amber-950">
            {formatMemberDate(user.purgeAt)}에 삭제됩니다. {daysUntil(user.purgeAt)}일 남았습니다.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/account">탈퇴 취소</Link>
          </Button>
        </div>
      ) : null}
      <div className="mt-6 rounded-xl bg-navy p-5 text-white">
        <p className="text-sm text-white/70">보유 포인트</p>
        <p className="text-3xl font-bold">{formatPoints(pointBalance)}</p>
        <p className="mt-1 text-sm text-white/70">구매 시 실결제 100원당 1포인트 적립 · 1P = 1원</p>
      </div>
      <section className="mt-8">
        <h2 className="font-semibold text-navy">주문 내역</h2>
        {myOrders.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">아직 주문이 없습니다.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {myOrders.map((order) => (
              <li key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <p className="font-semibold">{order.id}</p>
                <p className="text-slate-500">
                  {order.paymentMethod === "card" ? "카드" : "송금"} ·{" "}
                  {order.status === "paid" ? "결제 완료" : "입금 대기"} · {formatPrice(order.payable)}
                </p>
                {order.status === "pending-transfer" ? (
                  <Button size="sm" className="mt-2" onClick={() => confirmTransfer(order.id)}>
                    입금 완료 처리
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <h2 className="font-semibold text-navy">견적·문의</h2>
        {myInquiries.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            아직 문의가 없습니다.{" "}
            <Link href="/inquiry" className="text-[#0046CA] hover:underline">
              견적·문의
            </Link>
            나{" "}
            <Link href="/bom" className="text-[#0046CA] hover:underline">
              BOM
            </Link>
            에서 보낼 수 있습니다.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {myInquiries.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold">{item.id}</p>
                  <span className="text-xs text-slate-500">{inquiryStatusLabel[item.status]}</span>
                </div>
                <p className="mt-1 text-slate-600">{item.body}</p>
                {item.items.length ? (
                  <p className="mt-2 text-xs text-slate-500">
                    BOM {item.items.length}개 품목 · 참고 {formatPrice(inquiryTotal(item.items))}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("ko-KR")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-8">
        <h2 className="font-semibold text-navy">포인트 내역</h2>
        {myPoints.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">적립·사용 내역이 아직 없습니다.</p>
        ) : (
          <ul className="mt-3 divide-y rounded-xl border border-slate-200 bg-white">
            {myPoints.map((entry) => (
              <li key={entry.id} className="flex justify-between px-4 py-3 text-sm">
                <span>
                  {entry.reason}
                  <span className="block text-xs text-slate-400">
                    {new Date(entry.createdAt).toLocaleString("ko-KR")}
                  </span>
                </span>
                <span className={entry.delta >= 0 ? "font-semibold text-sky-700" : "font-semibold text-amber-700"}>
                  {entry.delta >= 0 ? "+" : ""}
                  {formatPoints(entry.delta)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
