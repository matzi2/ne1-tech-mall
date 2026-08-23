"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";
import { gabiaLinks } from "@/lib/gabia";

const PAGES = [
  { id: "login", label: "가비아 로그인", href: "https://accounts.gabia.com/" },
  { id: "dns", label: "DNS 관리툴", href: "https://dns.gabia.com/" },
  { id: "home", label: "가비아 홈", href: "https://www.gabia.com/" },
] as const;

export function GabiaDesk() {
  const [page, setPage] = useState<(typeof PAGES)[number]>(PAGES[0]);
  const [stamp, setStamp] = useState(0);

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[640px] flex-col bg-[#f1f3f4]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#000092]">이 창이 레몬의 가비아 작업창입니다</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          아래에서 가비아에 직접 로그인하세요. 아이디·비밀번호·보안 문자·인증번호는 이 화면에서만 입력하면 됩니다.
          로그인 후 <strong>DNS 관리툴</strong>을 열고 호스트 <code>www</code> · 타입 <code>CNAME</code> · 값{" "}
          <code>{company.dns.wwwTarget}.</code> 을 넣은 뒤 저장하세요.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PAGES.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={page.id === item.id ? "navy" : "outline"}
              onClick={() => setPage(item)}
            >
              {item.label}
            </Button>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => setStamp(Date.now())}>
            새로고침
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href="/connect/domain">넣을 값 보기</Link>
          </Button>
        </div>
        <p className="mt-2 truncate font-mono text-xs text-slate-500">{page.href}</p>
      </div>

      <iframe
        key={`${page.id}-${stamp}`}
        title="가비아 작업창"
        src={page.href}
        className="min-h-0 w-full flex-1 border-0 bg-white"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <div className="shrink-0 border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-950">
        지금 넣을 값: www · CNAME · {company.dns.wwwTarget}. (끝 마침표 포함) · MX/SPF/NS는 그대로 두기 ·{" "}
        {gabiaLinks[0].href}
      </div>
    </div>
  );
}
