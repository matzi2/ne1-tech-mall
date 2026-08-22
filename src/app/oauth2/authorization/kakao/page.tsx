"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { brand } from "@/lib/brand";
import { company } from "@/lib/company";

function makeAccessToken(payload: { nickname: string; account: string }) {
  const json = JSON.stringify({
    provider: "kakao",
    ...payload,
    iat: Date.now(),
  });
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `kakao.${btoa(binary)}`;
}

export function KakaoAuthorizeForm() {
  const params = useSearchParams();
  const redirectUri = params.get("redirect_uri") || `${typeof window === "undefined" ? "" : window.location.origin}/redirect`;
  const [step, setStep] = useState<"login" | "consent">("login");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const restKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

  const realAuthorize = useMemo(() => {
    if (!restKey || typeof window === "undefined") return null;
    const uri = new URL("https://kauth.kakao.com/oauth/authorize");
    uri.searchParams.set("client_id", restKey);
    uri.searchParams.set("redirect_uri", redirectUri);
    uri.searchParams.set("response_type", "code");
    return uri.toString();
  }, [redirectUri, restKey]);

  function goConsent(event: React.FormEvent) {
    event.preventDefault();
    if (!account.trim() || password.trim().length < 4) {
      setError("카카오계정과 비밀번호를 입력해 주세요.");
      return;
    }
    setError("");
    setStep("consent");
  }

  function agree() {
    const token = makeAccessToken({
      nickname: account.includes("@") ? account.split("@")[0] : account,
      account: account.trim(),
    });
    const target = new URL(redirectUri, window.location.origin);
    target.searchParams.set("accesstoken", token);
    window.location.href = target.toString();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-4 py-10">
      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2 px-6 pt-7">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#FEE500] text-lg font-black text-[#191919]">
            T
          </span>
          <p className="text-lg font-bold tracking-tight text-[#191919]">Kakao</p>
        </div>

        {realAuthorize ? (
          <div className="space-y-4 px-6 py-8">
            <h1 className="text-xl font-bold">카카오계정으로 로그인</h1>
            <p className="text-sm leading-6 text-slate-600">
              REST API 키가 있어 실제 카카오 로그인 창으로 이동합니다.
            </p>
            <a
              href={realAuthorize}
              className="flex h-12 items-center justify-center rounded-md text-sm font-semibold"
              style={{ background: brand.yellow, color: brand.kakaoBrown }}
            >
              카카오 로그인 계속
            </a>
          </div>
        ) : step === "login" ? (
          <form className="space-y-4 px-6 py-8" onSubmit={goConsent}>
            <h1 className="text-xl font-bold text-[#191919]">카카오계정 로그인</h1>
            <p className="text-sm text-slate-500">
              MATCHDOC과 같은 흐름입니다. 이 창에서 계정을 입력한 뒤 동의하면
              <code className="mx-1">/redirect?accesstoken=</code>
              으로 돌아갑니다.
            </p>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-500">카카오계정</span>
              <input
                className="h-12 w-full rounded-md border border-slate-300 px-3"
                placeholder="이메일 또는 전화번호"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                autoFocus
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-500">비밀번호</span>
              <input
                type="password"
                className="h-12 w-full rounded-md border border-slate-300 px-3"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              className="h-12 w-full rounded-md text-sm font-bold"
              style={{ background: brand.yellow, color: brand.kakaoBrown }}
            >
              로그인
            </button>
            <p className="text-center text-xs text-slate-400">
              카카오 REST 키가 없어 작업용 로그인 창입니다. 입력값은 이 브라우저에서만 쓰입니다.
            </p>
          </form>
        ) : (
          <div className="space-y-4 px-6 py-8">
            <h1 className="text-xl font-bold">동의하고 계속하기</h1>
            <p className="text-sm leading-6 text-slate-600">
              <strong>{company.nameKo} 쇼핑몰</strong>이 카카오계정 닉네임과 이메일 동의를 요청합니다.
            </p>
            <ul className="rounded-lg bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              <li>닉네임 (필수)</li>
              <li>카카오계정 (필수)</li>
              <li>로그인 후 accessToken을 localStorage에 저장</li>
            </ul>
            <button
              type="button"
              onClick={agree}
              className="h-12 w-full rounded-md text-sm font-bold"
              style={{ background: brand.yellow, color: brand.kakaoBrown }}
            >
              동의하고 계속하기
            </button>
            <button
              type="button"
              className="w-full text-sm text-slate-500"
              onClick={() => setStep("login")}
            >
              다른 계정으로
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KakaoAuthorizePage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">카카오 로그인 창을 준비하는 중입니다.</div>}>
      <KakaoAuthorizeForm />
    </Suspense>
  );
}
