"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GitHubConnectPanel } from "@/components/github-connect-panel";

const PAGES = [
  { id: "login", label: "GitHub 로그인", href: "https://github.com/login" },
  { id: "device", label: "장치 코드", href: "https://github.com/login/device" },
  { id: "tokens", label: "토큰 만들기", href: "https://github.com/settings/tokens?type=beta" },
] as const;

export function GitHubDesk() {
  const [page, setPage] = useState<(typeof PAGES)[number]>(PAGES[0]);
  const [stamp, setStamp] = useState(0);

  return (
    <div className="flex min-h-[720px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f1f3f4]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#000092]">관리자 · GitHub 로그인 창</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          이 창은 관리자 메일로 들어왔을 때만 보입니다. 쇼핑몰 메뉴에는 넣지 않습니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PAGES.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={page.id === item.id ? "navy" : "outline"}
              onClick={() => {
                setPage(item);
                setStamp(Date.now());
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => setStamp(Date.now())}>
            새로고침
          </Button>
        </div>
        <p className="mt-2 truncate font-mono text-xs text-slate-500">{page.href}</p>
      </div>
      <iframe
        key={`${page.id}-${stamp}`}
        title="GitHub 로그인 창"
        src={page.href}
        className="h-[420px] w-full border-0 bg-white md:h-[520px]"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="border-t border-slate-200 bg-white px-4 py-4">
        <GitHubConnectPanel />
      </div>
    </div>
  );
}
