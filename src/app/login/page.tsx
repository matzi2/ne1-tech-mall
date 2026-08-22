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
  const { login, user, logout, ready } = useApp();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const next = params.get("next") || "/mypage";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const message = login(email, password);
    if (message) {
      setError(message);
      return;
    }
    router.push(next);
  }

  if (!ready) {
    return <div className="p-10 text-sm text-slate-500">로그인 화면을 준비하는 중입니다.</div>;
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p className="text-xs font-semibold tracking-wide">EMAIL LOGIN</p>
          <h1 className="mt-1 text-xl font-bold">이메일 로그인됨 · {user.name}</h1>
          <p className="mt-2 text-sm leading-6">{user.email}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href={next}>마이페이지</Link>
            </Button>
            <Button type="button" variant="outline" onClick={logout}>
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold text-[#0046CA]">{company.domain}</p>
        <h1 className="mt-2 text-2xl font-bold text-navy">이메일 로그인</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          지금은 이메일과 비밀번호로 로그인합니다. 카카오는 나중에 붙입니다.
        </p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              className="mt-1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@ne1-tech.co.kr"
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              className="mt-1"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg">
            이메일로 로그인
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/find-account" className="text-[#0046CA]">
            아이디·비밀번호 찾기
          </Link>
          <Link href="/signup" className="text-[#0046CA]">
            회원가입
          </Link>
        </div>
      </section>
      <section className="rounded-2xl bg-navy p-6 text-white md:p-8">
        <h2 className="text-lg font-semibold">작업용 이메일 계정</h2>
        <p className="mt-2 text-sm text-white/70">누르면 이메일과 비밀번호가 채워집니다. 비밀번호는 모두 demo1234 입니다.</p>
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
