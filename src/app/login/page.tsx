"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brand } from "@/lib/brand";
import { company, demoAccounts } from "@/lib/company";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, loginWithKakao } = useApp();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; nickname?: string; account?: string };
      if (data?.type !== "ne1-kakao-login" || !data.account) return;
      loginWithKakao({ nickname: data.nickname || "카카오회원", account: data.account });
      router.push(params.get("next") || "/mypage");
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [loginWithKakao, params, router]);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-[#0046CA]">{company.domain}</p>
        <h1 className="mt-2 text-2xl font-bold text-navy">로그인</h1>
        <p className="mt-2 text-sm text-slate-500">
          카카오는 이 인앱 브라우저에서 MATCHDOC과 같은 OAuth 화면으로 이어집니다. 이메일 로그인도 바로 테스트할 수 있습니다.
        </p>
        <button
          type="button"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-md text-sm font-bold"
          style={{ background: brand.yellow, color: brand.kakaoBrown }}
          onClick={() => {
            const redirect = `${window.location.origin}/redirect`;
            router.push(`/oauth2/authorization/kakao?redirect_uri=${encodeURIComponent(redirect)}`);
          }}
        >
          카카오 로그인
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          OAuth2 · /oauth2/authorization/kakao → /redirect?accesstoken=
        </p>
        <div className="my-6 h-px bg-slate-200" />
        <form
          className="space-y-4"
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
            이메일 로그인
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
        <Link href="/connect" className="mt-6 inline-block text-sm text-sky-200 underline">
          모든 사이트 연결 작업실
        </Link>
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
