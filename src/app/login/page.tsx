"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { company, demoAccounts } from "@/lib/company";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useApp();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-sky-700">{company.domain}</p>
        <h1 className="mt-2 text-2xl font-bold text-navy">로그인</h1>
        <p className="mt-2 text-sm text-slate-500">
          회원 로그인 후 주문하면 포인트가 적립됩니다. 이 화면에서 바로 테스트할 수 있습니다.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const message = login(email, password);
            if (message) {
              setError(message);
              return;
            }
            router.push(params.get("next") || "/mypage");
          }}
        >
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg">
            로그인
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/find-account" className="text-sky-700">
            아이디·비밀번호 찾기
          </Link>
          <Link href="/signup" className="text-sky-700">
            회원가입
          </Link>
        </div>
      </section>
      <section className="rounded-2xl bg-navy p-8 text-white">
        <h2 className="text-lg font-semibold">작업용 테스트 계정</h2>
        <p className="mt-2 text-sm text-white/70">
          클릭하면 이메일이 채워집니다. 비밀번호는 모두 demo1234 입니다.
        </p>
        <ul className="mt-5 space-y-3">
          {demoAccounts.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                className="w-full rounded-xl bg-white/10 p-4 text-left hover:bg-white/15"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setError("");
                }}
              >
                <p className="font-semibold">{account.type}</p>
                <p className="text-sm text-white/70">{account.email}</p>
              </button>
            </li>
          ))}
        </ul>
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
