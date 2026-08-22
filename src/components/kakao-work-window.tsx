"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { brand } from "@/lib/brand";
import { company } from "@/lib/company";
import { KAKAO_KEYS_STORAGE, type KakaoKeys } from "@/lib/connections";

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

const demoKakao = {
  account: "matzi57@gmail.com",
  password: "kakao1234",
  nickname: "정범",
};

export function KakaoWorkWindow() {
  const [step, setStep] = useState<"login" | "consent">("login");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hasKeys, setHasKeys] = useState(false);

  useMemo(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(KAKAO_KEYS_STORAGE);
    if (!stored) return;
    const keys = JSON.parse(stored) as KakaoKeys;
    setHasKeys(Boolean(keys.restApiKey?.trim()));
  }, []);

  function goConsent(event: React.FormEvent) {
    event.preventDefault();
    if (!account.trim() || password.trim().length < 4) {
      setError("카카오계정과 비밀번호를 입력해 주세요.");
      return;
    }
    setError("");
    setStep("consent");
  }

  function fillDemo() {
    setAccount(demoKakao.account);
    setPassword(demoKakao.password);
    setError("");
  }

  function agree() {
    const token = makeAccessToken({
      nickname: account.includes("@") ? account.split("@")[0] : account,
      account: account.trim(),
    });
    const target = new URL("/redirect", window.location.origin);
    target.searchParams.set("accesstoken", token);
    target.searchParams.set("next", "/oauth2/authorization/kakao");
    window.location.assign(target.toString());
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-[#FEE500] px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#191919] text-lg font-black text-[#FEE500]">
            T
          </span>
          <div>
            <p className="text-sm font-bold text-[#191919]">Kakao 로그인</p>
            <p className="text-xs text-[#191919]/70">{company.nameKo} 쇼핑몰 · MATCHDOC 흐름</p>
          </div>
        </div>

        {hasKeys ? (
          <p className="mx-5 mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            REST API 키가 저장되어 있습니다. 실제 kauth.kakao.com 은 이 Preview를 깨므로, 같은 동의
            흐름을 이 창에서 마칩니다.
          </p>
        ) : null}

        {step === "login" ? (
          <form className="space-y-4 px-5 py-6" onSubmit={goConsent}>
            <h1 className="text-xl font-bold text-[#191919]">카카오계정 로그인</h1>
            <p className="text-sm leading-6 text-slate-600">
              이 Chrome 작업창에서 계정을 넣고 동의하면
              <code className="mx-1">/redirect?accesstoken=</code>
              으로 돌아와 쇼핑몰에 로그인됩니다.
            </p>
            <button
              type="button"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm"
              onClick={fillDemo}
            >
              <span className="font-semibold text-[#000092]">작업용 계정 채우기</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                {demoKakao.account} · 비밀번호 kakao1234
              </span>
            </button>
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
              입력값은 이 브라우저에만 남습니다. 카카오 서버로 보내지 않습니다.
            </p>
          </form>
        ) : (
          <div className="space-y-4 px-5 py-6">
            <h1 className="text-xl font-bold text-[#191919]">동의하고 계속하기</h1>
            <p className="text-sm leading-6 text-slate-600">
              <strong>{company.nameKo} 쇼핑몰</strong>이 카카오계정 닉네임과 이메일을 요청합니다.
            </p>
            <ul className="rounded-lg bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              <li>계정: {account}</li>
              <li>닉네임 (필수)</li>
              <li>로그인 후 accessToken을 이 브라우저에 저장</li>
            </ul>
            <button
              type="button"
              onClick={agree}
              className="h-12 w-full rounded-md text-sm font-bold"
              style={{ background: brand.yellow, color: brand.kakaoBrown }}
            >
              동의하고 계속하기
            </button>
            <button type="button" className="w-full text-sm text-slate-500" onClick={() => setStep("login")}>
              다른 계정으로
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        REST 키는{" "}
        <Link href="/connect/kakao-developers" className="text-[#0046CA] underline">
          디벨로퍼스 탭
        </Link>
        에 저장합니다.
      </p>
    </div>
  );
}
