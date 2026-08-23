"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";
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
  const initial = PAGES.find((item) => item.id === (searchParams.get("view") ?? "dns")) ?? PAGES[1];
  const [page, setPage] = useState<(typeof PAGES)[number]>(initial);
  const [stamp, setStamp] = useState(0);

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[640px] flex-col bg-[#f1f3f4]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#000092]">다음: 호스트 @ · A · {HOSTING_WAN_IPV4}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          www CNAME과 _dmarc TXT는 공개 DNS에 있습니다. MX·SPF·NS는 그대로 둡니다. 지금 넣을 값은 시놀로지 DDNS가
          가리키는 공유기 WAN <code className="font-mono">{HOSTING_WAN_IPV4}</code> 입니다. 이 작업 서버 IP는 넣지
          않습니다.
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
            <Link href="/connect/domain">공개 DNS 조회</Link>
          </Button>
        </div>
        <p className="mt-2 truncate font-mono text-xs text-slate-500">{page.href}</p>
        <div className="mt-3 max-h-[40vh] overflow-auto">
          <GabiaLoginForm />
        </div>
      </div>

      <iframe
        key={`${page.id}-${stamp}`}
        title="가비아 작업창"
        src={page.href}
        className="min-h-0 w-full flex-1 border-0 bg-white"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <div className="shrink-0 border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-950">
        호스트 @ · 타입 A · 값 {HOSTING_WAN_IPV4} · TTL 1800 · {gabiaLinks[2].href}
      </div>
    </div>
  );
}
