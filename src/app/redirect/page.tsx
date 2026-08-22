"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { ACCESS_TOKEN_KEY, CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";

function decodeKakaoToken(token: string) {
  const parts = token.split(".");
  if (parts[0] !== "kakao" || !parts[1]) return { nickname: "카카오회원", account: "kakao-user" };
  try {
    const binary = atob(parts[1]);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = JSON.parse(new TextDecoder().decode(bytes)) as {
      nickname?: string;
      account?: string;
    };
    return {
      nickname: json.nickname || "카카오회원",
      account: json.account || "kakao-user",
    };
  } catch {
    return { nickname: "카카오회원", account: "kakao-user" };
  }
}

function RedirectHandler() {
  const params = useSearchParams();
  const { loginWithKakao } = useApp();
  const [message, setMessage] = useState("카카오 로그인 결과를 저장하는 중입니다.");
  const [ok, setOk] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const token = params.get("accesstoken") || params.get("accessToken");
    const code = params.get("code");
    if (!token && code) {
      setMessage("카카오 인가 코드는 받았습니다. Client Secret이 없어 토큰 교환을 건너뜁니다. 카카오 탭에서 작업용 로그인으로 다시 진행해 주세요.");
      return;
    }
    if (!token) {
      setMessage("accesstoken이 없습니다. 카카오 탭에서 다시 로그인해 주세요.");
      return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, `Bearer ${token}`);
    const profile = decodeKakaoToken(token);
    loginWithKakao(profile);
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.kakao = { connected: true, nickname: profile.nickname, at: new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    setNickname(profile.nickname);
    setOk(true);
    setMessage("카카오 로그인을 저장했습니다. 이 작업창에서 다음 연결로 이어갑니다.");
  }, [loginWithKakao, params]);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div
        className={`rounded-2xl border p-6 ${
          ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        <p className="text-xs font-semibold tracking-wide">KAKAO REDIRECT</p>
        <h1 className="mt-1 text-xl font-bold">{ok ? `연결됨 · ${nickname}` : "로그인 처리"}</h1>
        <p className="mt-3 text-sm leading-6">{message}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/oauth2/authorization/kakao"
            className="inline-flex h-11 items-center rounded-lg bg-[#000092] px-4 text-sm font-semibold text-white"
          >
            카카오 연결 상태
          </Link>
          {ok ? (
            <Link
              href="/connect/card"
              className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800"
            >
              카드 결제 테스트
            </Link>
          ) : (
            <Link
              href="/oauth2/authorization/kakao"
              className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800"
            >
              다시 로그인
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedirectPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">리다이렉트 처리 중…</div>}>
      <RedirectHandler />
    </Suspense>
  );
}
