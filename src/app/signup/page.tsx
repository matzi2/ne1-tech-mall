"use client";

import Link from "next/link";
import { useState } from "react";
import { EmailOtpForm } from "@/components/email-otp-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/lib/company";
import { retentionLabel } from "@/lib/membership";

export default function SignupPage() {
  const [role, setRole] = useState<Role>("member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-navy">회원가입</h1>
        <p className="mt-2 text-sm text-slate-500">
          이름과 이메일만 있으면 됩니다. 비밀번호는 만들지 않고, 1회용 비밀번호로 바로 들어옵니다. 탈퇴는
          마이페이지에서 하고, {retentionLabel()} 보관 뒤 삭제됩니다.
        </p>
        {ready ? (
          <div className="mt-6">
            <EmailOtpForm initialEmail={email} name={name} role={role} next="/mypage" submitLabel="확인하고 가입" />
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) {
                setError("이름을 입력해 주세요.");
                return;
              }
              if (!email.includes("@")) {
                setError("올바른 이메일을 입력해 주세요.");
                return;
              }
              setError("");
              setReady(true);
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={role === "member" ? "default" : "outline"} onClick={() => setRole("member")}>
                개인
              </Button>
              <Button
                type="button"
                variant={role === "business" ? "default" : "outline"}
                onClick={() => setRole("business")}
              >
                사업자
              </Button>
            </div>
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                className="mt-1"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="담당자 이름"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="받는 이메일"
                required
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg">
              다음 · 1회용 비밀번호
            </Button>
          </form>
        )}
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/login" className="text-sky-700">
            이미 가입 · 로그인
          </Link>
          <Link href="/login?next=/account" className="text-sky-700">
            탈퇴 취소
          </Link>
        </div>
      </div>
    </div>
  );
}
