"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { ACCESS_TOKEN_KEY, CONNECTIONS_STORAGE } from "@/lib/connections";

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
  const router = useRouter();
  const { loginWithKakao } = useApp();
  const [message, setMessage] = useState("카카오 로그인 결과를 저장하는 중입니다.");

  useEffect(() => {
    const token = params.get("accesstoken") || params.get("accessToken");
    const code = params.get("code");
    if (!token && code) {
      setMessage("카카오 인가 코드는 받았습니다. REST 시크릿이 없어 토큰 교환을 건너뜁니다. 작업용 로그인 창에서 다시 진행해 주세요.");
      return;
    }
    if (!token) {
      setMessage("accesstoken이 없습니다. 카카오 로그인 창에서 다시 시도해 주세요.");
      return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, `Bearer ${token}`);
    const profile = decodeKakaoToken(token);
    loginWithKakao(profile);
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as {
      kakao?: { connected: boolean; nickname: string; at: string };
    };
    local.kakao = { connected: true, nickname: profile.nickname, at: new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    const payload = { type: "ne1-kakao-login", accessToken: token, ...profile };
    window.opener?.postMessage(payload, window.location.origin);
    const next = params.get("next") || "/mypage";
    const timer = window.setTimeout(() => {
      if (window.opener) {
        window.close();
      } else {
        router.replace(next);
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [loginWithKakao, params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-[#FEE500] mix-blend-multiply">Kakao</p>
        <h1 className="mt-2 text-xl font-bold text-[#191919]">로그인 처리</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
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
