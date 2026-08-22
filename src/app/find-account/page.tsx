"use client";

import Link from "next/link";
import { EmailOtpForm } from "@/components/email-otp-form";

export default function FindAccountPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-navy">계정 찾기</h1>
        <p className="mt-2 text-sm text-slate-500">
          가입 이메일을 넣고 1회용 비밀번호를 받으면 바로 로그인됩니다. 고정 비밀번호는 없습니다.
        </p>
        <div className="mt-6">
          <EmailOtpForm submitLabel="1회용 비밀번호로 찾기" />
        </div>
        <Link href="/login" className="mt-6 inline-block text-sm text-sky-700">
          로그인 화면으로
        </Link>
      </div>
    </div>
  );
}
