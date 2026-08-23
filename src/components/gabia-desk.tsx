"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";
import { gabiaLinks } from "@/lib/gabia";

const PAGES = [
  { id: "login", label: "가비아 로그인", href: "https://accounts.gabia.com/" },
  { id: "dns", label: "DNS 관리툴", href: "https://dns.gabia.com/" },
  { id: "home", label: "가비아 홈", href: "https://www.gabia.com/" },
] as const;

export function GabiaDesk() {
  const searchParams = useSearchParams();
  const initial = PAGES.find((item) => item.id === (searchParams.get("view") ?? "dns")) ?? PAGES[1];
  const [page, setPage] = useState<(typeof PAGES)[number]>(initial);
  const [stamp, setStamp] = useState(0);

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[640px] flex-col bg-[#f1f3f4]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#000092]">로그인됨 · 이제 DNS만 넣으면 됩니다</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          아래가 가비아 DNS 관리툴입니다. <strong>ne1-tech.co.kr</strong> 을 고른 뒤 레코드를 추가하고 반드시{" "}
          <strong>저장</strong>을 누르세요.
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
          <li>
            호스트 <code>www</code> · 타입 <code>CNAME</code> · 값 <code>{company.dns.wwwTarget}.</code> (끝 마침표)
          </li>
          <li>MX · TXT · NS 는 이미 있으니 건드리지 않습니다.</li>
          <li>호스팅 IP가 아직 없어 A 레코드는 보류합니다.</li>
        </ol>
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
            <Link href="/connect/domain">공개 DNS 조회</Link>
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
        지금 넣을 값: www · CNAME · {company.dns.wwwTarget}. (끝 마침표 포함) · {gabiaLinks[2].href}
      </div>
    </div>
  );
}
