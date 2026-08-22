"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { KakaoWorkWindow } from "@/components/kakao-work-window";
import { ACCESS_TOKEN_KEY, CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";
import { useApp } from "@/components/app-providers";

function KakaoConnectView() {
  const { user } = useApp();
  const [connected, setConnected] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (local.kakao?.connected || token) {
      setConnected(true);
      setNickname(local.kakao?.nickname || user?.name || "카카오회원");
    }
  }, [user]);

  if (connected) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p className="text-xs font-semibold tracking-wide">KAKAO CONNECTED</p>
          <h1 className="mt-1 text-xl font-bold">카카오 로그인됨 · {nickname}</h1>
          <p className="mt-2 text-sm leading-6">
            MATCHDOC과 같은 흐름으로 accessToken을 이 브라우저에 저장했습니다. 다음은 카드 결제
            테스트입니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/connect/card"
              className="inline-flex h-11 items-center rounded-lg bg-[#000092] px-4 text-sm font-semibold text-white"
            >
              카드 결제 테스트
            </Link>
            <Link
              href="/mypage"
              className="inline-flex h-11 items-center rounded-lg border border-emerald-300 bg-white px-4 text-sm font-semibold text-emerald-900"
            >
              마이페이지
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <KakaoWorkWindow />;
}

export default function KakaoAuthorizePage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">카카오 로그인 창을 준비하는 중입니다.</div>}>
      <KakaoConnectView />
    </Suspense>
  );
}
