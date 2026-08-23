"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canWithdraw, daysUntil, formatMemberDate, retentionLabel } from "@/lib/membership";

export default function AccountPage() {
  const router = useRouter();
  const { user, ready, withdrawAccount, cancelWithdrawal, logout } = useApp();
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="p-10 text-sm text-slate-500">회원 정보를 불러오는 중입니다.</div>;

  if (!user) {
    router.replace("/login?next=/account");
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p>로그인 화면으로 이동합니다.</p>
        <Button asChild className="mt-4">
          <Link href="/login?next=/account">로그인</Link>
        </Button>
      </div>
    );
  }

  const withdrawn = user.status === "withdrawn";

  async function cancel() {
    setBusy(true);
    setError("");
    const message = await cancelWithdrawal();
    setBusy(false);
    if (message) setError(message);
  }

  async function withdraw() {
    if (confirm.trim() !== "탈퇴") {
      setError("확인을 위해 탈퇴 라고 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    const message = await withdrawAccount(reason);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    router.replace("/withdrawn");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <p className="text-xs font-semibold tracking-wide text-[#0046CA]">ACCOUNT</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">가입 · 탈퇴</h1>
      <p className="mt-2 text-sm text-slate-500">
        이메일만으로 가입합니다. 탈퇴하면 {retentionLabel()} 동안 보관했다가 삭제합니다.
      </p>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">이메일</p>
        <p className="font-semibold text-navy">{user.email}</p>
        <p className="mt-3 text-sm text-slate-500">이름</p>
        <p className="font-semibold text-navy">{user.name}</p>
        <p className="mt-3 text-sm text-slate-500">구분</p>
        <p className="font-semibold text-navy">
          {user.role === "admin" ? "관리자" : user.role === "business" ? "사업자 회원" : "개인 회원"}
        </p>
        <p className="mt-3 text-sm text-slate-500">상태</p>
        <p className="font-semibold text-navy">{withdrawn ? "탈퇴 대기" : "이용 중"}</p>
      </section>

      {withdrawn ? (
        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-navy">탈퇴 대기</h2>
          <p className="mt-2 text-sm leading-6 text-amber-950">
            {formatMemberDate(user.purgeAt)}에 삭제됩니다. 앞으로 {daysUntil(user.purgeAt)}일 남았습니다. 그 전에
            취소하면 주문·포인트·문의가 그대로 이어집니다.
          </p>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => void cancel()} disabled={busy}>
              탈퇴 취소하고 계속 쓰기
            </Button>
            <Button variant="outline" onClick={logout}>
              로그아웃
            </Button>
          </div>
        </section>
      ) : canWithdraw(user.email) ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-navy">회원 탈퇴</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            탈퇴하면 바로 로그아웃됩니다. 개인정보와 포인트·문의는 {retentionLabel()} 동안 보관되며, 그 사이
            다시 로그인하면 취소할 수 있습니다. 기간이 끝나면 자동 삭제됩니다.
          </p>
          <div className="mt-4">
            <Label htmlFor="reason">탈퇴 사유 (선택)</Label>
            <Input
              id="reason"
              className="mt-1"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="예: 더 이상 구매하지 않음"
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="confirm">확인</Label>
            <Input
              id="confirm"
              className="mt-1"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="탈퇴"
            />
            <p className="mt-1 text-xs text-slate-500">탈퇴 라고 입력하면 바로 처리됩니다.</p>
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <Button className="mt-4 w-full" variant="outline" disabled={busy} onClick={() => void withdraw()}>
            탈퇴하기
          </Button>
        </section>
      ) : (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          관리자 계정은 탈퇴할 수 없습니다.
        </p>
      )}

      <p className="mt-6 text-sm">
        <Link href="/mypage" className="text-[#0046CA] hover:underline">
          마이페이지
        </Link>
      </p>
    </div>
  );
}
