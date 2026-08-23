"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GabiaLoginForm } from "@/components/gabia-login-form";
import { HOSTING_WAN_IPV4 } from "@/lib/hosting";
import { gabiaLinks } from "@/lib/gabia";
import type { GabiaPublicState } from "@/lib/gabia-types";

const PAGES = [
  { id: "login", label: "가비아 로그인", href: "https://accounts.gabia.com/" },
  { id: "dns", label: "DNS 관리툴", href: "https://dns.gabia.com/" },
  { id: "home", label: "가비아 홈", href: "https://www.gabia.com/" },
] as const;

export function GabiaDesk() {
  const searchParams = useSearchParams();
  const initial = PAGES.find((item) => item.id === (searchParams.get("view") ?? "login")) ?? PAGES[0];
  const [page, setPage] = useState<(typeof PAGES)[number]>(initial);
  const [stamp, setStamp] = useState(0);
  const [gabia, setGabia] = useState<GabiaPublicState | null>(null);
  const hideOfficial = gabia?.status === "foreign";

  useEffect(() => {
    fetch("/api/connect/gabia/status")
      .then((response) => response.json())
      .then((next: GabiaPublicState) => setGabia(next))
      .catch(() => undefined);
    const timer = window.setInterval(() => {
      fetch("/api/connect/gabia/status")
        .then((response) => response.json())
        .then((next: GabiaPublicState) => setGabia(next))
        .catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-[640px] flex-col bg-[#f1f3f4] lg:h-[calc(100dvh-3.25rem)]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#000092]">가비아 작업창 · 해외 IP 인증 후 A 레코드</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          이 왼쪽 칸에서만 인증하세요. 오른쪽 가비아 화면과 동시에 인증하면 번호가 섞여 거절됩니다. 확인되면 호스트{" "}
          <code>@</code> · A · <code className="font-mono">{HOSTING_WAN_IPV4}</code> 를 등록합니다.
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
            오른쪽 새로고침
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href="/connect/domain">공개 DNS 조회</Link>
          </Button>
        </div>
        <p className="mt-2 truncate font-mono text-xs text-slate-500">{page.href}</p>
      </div>

      <div className={hideOfficial ? "min-h-0 flex-1" : "grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,420px)_1fr]"}>
        <div className="min-h-[480px] overflow-auto border-b border-slate-200 bg-white px-4 py-4 lg:border-b-0 lg:border-r">
          <GabiaLoginForm />
        </div>
        {hideOfficial ? (
          <p className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            해외 IP 인증 중에는 가비아 공식 화면을 가립니다. 문자가 두 곳에서 나가 번호가 섞이지 않게 합니다. 인증은 위
            칸에서만 하세요.
          </p>
        ) : (
          <iframe
            key={`${page.id}-${stamp}`}
            title="가비아 공식 화면"
            src={page.href}
            className="min-h-[480px] w-full border-0 bg-white lg:min-h-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      <div className="shrink-0 border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-950">
        작업 순서: 비밀번호 → 인증번호 다시 받기 → 숫자 확인 → A(@) {HOSTING_WAN_IPV4} · {gabiaLinks[2].href}
      </div>
    </div>
  );
}
