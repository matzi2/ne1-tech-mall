"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EmailOtpForm } from "@/components/email-otp-form";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { company, isAdmin } from "@/lib/company";

function LoginForm() {
  const params = useSearchParams();
  const { user, logout, ready } = useApp();
  const requestedNext = params.get("next") || "";
  const next = isAdmin(user)
    ? requestedNext || "/admin"
    : requestedNext.startsWith("/admin") || requestedNext.startsWith("/connect")
      ? "/mypage"
      : requestedNext || "/mypage";

  if (!ready) {
    return <div className="p-10 text-sm text-slate-500">로그인 화면을 준비하는 중입니다.</div>;
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p className="text-xs font-semibold tracking-wide">EMAIL SESSION</p>
          <h1 className="mt-1 text-xl font-bold">로그인 유지 중 · {user.name}</h1>
          <p className="mt-2 text-sm leading-6">{user.email}</p>
          <p className="mt-1 text-xs">비밀번호는 저장하지 않습니다. 이 브라우저에서 세션이 유지됩니다.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {isAdmin(user) ? (
              <>
                <Button asChild>
                  <Link href="/admin">운영화면</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/nas">NAS</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/gabia">가비아</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/github">GitHub</Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href={next}>마이페이지</Link>
              </Button>
            )}
            <Button type="button" variant="outline" onClick={logout}>
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold text-[#0046CA]">{company.domain}</p>
        <h1 className="mt-2 text-2xl font-bold text-navy">이메일 로그인</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          비밀번호는 서버에 저장하지 않습니다. 이메일로 받은 1회용 비밀번호로 확인하면, 이후에는 이
          브라우저에서 로그인이 유지됩니다. 관리자 화면은 관리자 이메일로 접속한 뒤에만 보입니다.
        </p>
        <div className="mt-6">
          <EmailOtpForm initialEmail={params.get("email") ?? ""} next={params.get("next") || "/mypage"} />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/find-account" className="text-[#0046CA]">
            계정 찾기
          </Link>
          <Link href="/signup" className="text-[#0046CA]">
            회원가입
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">로그인 화면을 준비하는 중입니다.</div>}>
      <LoginForm />
    </Suspense>
  );
}
