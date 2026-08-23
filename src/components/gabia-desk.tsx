"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GabiaLoginForm } from "@/components/gabia-login-form";
import { HOSTING_WAN_IPV4 } from "@/lib/hosting";
import { gabiaLinks } from "@/lib/gabia";

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

  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] flex-col bg-[#f1f3f4] lg:h-[calc(100vh-7.5rem)]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#000092]">가비아 작업창 · 해외 IP 인증 후 A 레코드</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          왼쪽에서 비밀번호를 넣고 인증번호를 받은 뒤 확인하세요. 로그인이 끝나면 호스트 <code>@</code> · A ·{" "}
          <code className="font-mono">{HOSTING_WAN_IPV4}</code> 를 등록합니다. 비밀번호는 이 창에만 입력합니다.
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

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,420px)_1fr]">
        <div className="min-h-[480px] overflow-auto border-b border-slate-200 bg-white px-4 py-4 lg:border-b-0 lg:border-r">
          <GabiaLoginForm />
        </div>
        <iframe
          key={`${page.id}-${stamp}`}
          title="가비아 공식 화면"
          src={page.href}
          className="min-h-[480px] w-full border-0 bg-white lg:min-h-0"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="shrink-0 border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-950">
        작업 순서: 비밀번호 → 인증번호 다시 받기 → 숫자 확인 → A(@) {HOSTING_WAN_IPV4} · {gabiaLinks[2].href}
      </div>
    </div>
  );
}
