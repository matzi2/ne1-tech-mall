"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GabiaLoginForm } from "@/components/gabia-login-form";
import { HOSTING_WAN_IPV4 } from "@/lib/hosting";
import { company } from "@/lib/company";

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
  const [showWorkForm, setShowWorkForm] = useState(false);

  return (
    <div className="flex min-h-[640px] flex-col bg-[#f1f3f4] lg:h-[calc(100dvh-3.25rem)]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#000092]">가비아 작업창 · 사이트에서 로그인</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          아래 가비아 사이트에서 직접 로그인하세요. 이 작업 서버 문자 인증은 한도가 찼으니 쓰지 않습니다. 로그인 후{" "}
          <strong>DNS 관리툴</strong>에서 호스트 <code>@</code> · A ·{" "}
          <code className="font-mono">{HOSTING_WAN_IPV4}</code> 만 추가하고 저장하세요. www · MX · SPF · NS 는 그대로
          둡니다.
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
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href="/connect/domain">공개 DNS 조회</Link>
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setShowWorkForm((open) => !open)}>
            {showWorkForm ? "작업창 인증 닫기" : "작업창 인증(한도 걸림)"}
          </Button>
        </div>
        <p className="mt-2 truncate font-mono text-xs text-slate-500">{page.href}</p>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700">
          넣을 값: <span className="font-mono">{company.apex}</span> · 호스트 <code>@</code> · A ·{" "}
          <span className="font-mono">{HOSTING_WAN_IPV4}</span> · TTL {company.dns.ttl}
        </div>
      </div>

      {showWorkForm ? (
        <div className="max-h-[40vh] overflow-auto border-b border-slate-200 bg-white px-4 py-4">
          <GabiaLoginForm />
        </div>
      ) : null}

      <iframe
        key={`${page.id}-${stamp}`}
        title="가비아 공식 화면"
        src={page.href}
        className="min-h-[520px] w-full flex-1 border-0 bg-white"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
