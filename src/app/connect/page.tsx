"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ACCESS_TOKEN_KEY,
  CONNECTIONS_STORAGE,
  KAKAO_KEYS_STORAGE,
  siteConnections,
  type ConnectionId,
  type LocalConnectionState,
} from "@/lib/connections";
import { openWorkWindow } from "@/lib/work-window";
import { Button } from "@/components/ui/button";
import type { GitHubConnectState } from "@/lib/github-types";
import { company } from "@/lib/company";

function statusLabel(id: ConnectionId, github: GitHubConnectState | null, local: LocalConnectionState) {
  if (id === "github") {
    if (github?.status === "published") return { text: "저장소 연결됨", tone: "ok" as const };
    if (github?.status === "authorized") return { text: "로그인됨 · 푸시 대기", tone: "ok" as const };
    if (github?.status === "pending") return { text: "코드 입력 대기", tone: "wait" as const };
    if (github?.status === "error") return { text: "다시 연결 필요", tone: "err" as const };
    return { text: "연결 전 · 작업 창에서 로그인", tone: "idle" as const };
  }
  if (id === "kakao") {
    return local.kakao?.connected || (typeof window !== "undefined" && localStorage.getItem(ACCESS_TOKEN_KEY))
      ? { text: "카카오 로그인됨", tone: "ok" as const }
      : { text: "연결 전 · 카카오 창에서 로그인", tone: "idle" as const };
  }
  if (id === "kakao-developers") {
    return local.kakaoDevelopers?.saved
      ? { text: "앱 키 저장됨", tone: "ok" as const }
      : { text: "키 등록 전", tone: "idle" as const };
  }
  if (id === "card") {
    return local.card?.tested
      ? { text: `테스트 완료 · ${local.card.last4}`, tone: "ok" as const }
      : { text: "결제 창에서 카드 입력", tone: "idle" as const };
  }
  if (id === "bank") {
    return local.bank?.confirmed
      ? { text: "송금 안내 확인", tone: "ok" as const }
      : { text: "계좌 확인 전", tone: "idle" as const };
  }
  if (id === "ci") {
    return local.ci?.reviewed ? { text: "CI 확인됨", tone: "ok" as const } : { text: "색·로고 비교", tone: "idle" as const };
  }
  if (id === "domain") {
    return { text: `${company.domain} 점검`, tone: "idle" as const };
  }
  if (id === "origin") {
    return { text: "Cursor 원격 연결됨", tone: "ok" as const };
  }
  return { text: "작업 가능", tone: "idle" as const };
}

export default function ConnectHubPage() {
  const [github, setGithub] = useState<GitHubConnectState | null>(null);
  const [local, setLocal] = useState<LocalConnectionState>({});

  useEffect(() => {
    fetch("/api/connect/github/status")
      .then((response) => response.json())
      .then((next: GitHubConnectState) => setGithub(next))
      .catch(() => undefined);
    setLocal(JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState);
    const keys = localStorage.getItem(KAKAO_KEYS_STORAGE);
    if (keys) {
      setLocal((prev) => ({ ...prev, kakaoDevelopers: prev.kakaoDevelopers ?? { saved: true, at: "" } }));
    }
  }, []);

  function openConnection(id: ConnectionId) {
    const item = siteConnections.find((entry) => entry.id === id);
    if (!item) return;
    openWorkWindow(item.href, item.windowName, { width: item.width, height: item.height });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-[#0046CA]">SITE CONNECTIONS</p>
      <h1 className="mt-2 text-3xl font-bold text-[#000092]">사이트 연결 작업실</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        백그라운드에서 건너뛰지 않습니다. 각 버튼을 누르면 로그인·설정 화면이 작업 창으로 열리고, 이 화면에서도 바로 이어서 할 수 있습니다.
        GitHub부터 카카오, 카드, 송금까지 직접 보고 연결하세요.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={() => openConnection("github")}>
          GitHub부터 연결
        </Button>
        <Button type="button" variant="outline" onClick={() => openConnection("kakao")}>
          카카오 로그인 창
        </Button>
        <Button asChild variant="secondary">
          <Link href="/connect/github">이 탭에서 GitHub 작업</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {siteConnections.map((item) => {
          const status = statusLabel(item.id, github, local);
          return (
            <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.site}</p>
                  <h2 className="mt-1 text-lg font-bold text-[#000092]">{item.name}</h2>
                </div>
                <span
                  className={
                    status.tone === "ok"
                      ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                      : status.tone === "wait"
                        ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800"
                        : status.tone === "err"
                          ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                          : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  }
                >
                  {status.text}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.purpose}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => openConnection(item.id)}>
                  {item.actionLabel}
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={item.href}>이 탭에서 작업</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
