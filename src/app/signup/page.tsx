"use client";

import Link from "next/link";
import { useState } from "react";
import { EmailOtpForm } from "@/components/email-otp-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/lib/company";

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
          비밀번호는 만들지 않습니다. 이메일 1회용 비밀번호로 확인한 뒤 로그인이 유지됩니다.
        </p>
        {ready ? (
          <div className="mt-6">
            <EmailOtpForm initialEmail={email} name={name} role={role} next="/mypage" />
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
                개인 회원
              </Button>
              <Button
                type="button"
                variant={role === "business" ? "default" : "outline"}
                onClick={() => setRole("business")}
              >
                사업자 회원
              </Button>
            </div>
            <div>
              <Label htmlFor="name">이름</Label>
              <Input id="name" className="mt-1" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg">
              1회용 비밀번호로 가입
            </Button>
          </form>
        )}
        <p className="mt-4 text-sm">
          이미 계정이 있으면 <Link href="/login" className="text-sky-700">로그인</Link>
        </p>
      </div>
    </div>
  );
}
