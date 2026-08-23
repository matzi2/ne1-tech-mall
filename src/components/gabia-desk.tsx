"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GabiaLoginForm } from "@/components/gabia-login-form";
import { HOSTING_WAN_IPV4 } from "@/lib/hosting";
import { company } from "@/lib/company";
import { gabiaCopyLine, gabiaRecords } from "@/lib/gabia";

const PAGES = [
  { id: "dns", label: "DNS 관리툴", href: "https://dns.gabia.com/" },
  { id: "login", label: "가비아 로그인", href: "https://accounts.gabia.com/" },
  { id: "home", label: "가비아 홈", href: "https://www.gabia.com/" },
] as const;

type Lookup = { kind: string; hostname: string; values: string[]; error?: string };

const TARGET_ROWS = [
  { host: "@", type: "A", value: HOSTING_WAN_IPV4, note: "공유기 WAN. 작업 서버 NAT는 넣지 않음" },
  { host: "www", type: "CNAME", value: `${company.dns.wwwTarget}.`, note: "www → 루트" },
  { host: "@", type: "MX", value: "10 aspmx.daum.net.", note: "메일 유지" },
  { host: "@", type: "MX", value: "20 alt.aspmx.daum.net.", note: "메일 유지" },
  { host: "@", type: "TXT", value: company.dns.spf, note: "SPF 유지" },
  { host: "_dmarc", type: "TXT", value: "v=DMARC1; p=none;", note: "DMARC 유지" },
] as const;

export function GabiaDesk() {
  const searchParams = useSearchParams();
  const initial = PAGES.find((item) => item.id === (searchParams.get("view") ?? "dns")) ?? PAGES[0];
  const [page, setPage] = useState<(typeof PAGES)[number]>(initial);
  const [stamp, setStamp] = useState(0);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [lookups, setLookups] = useState<Lookup[]>([]);
  const [liveMessage, setLiveMessage] = useState("공개 DNS를 조회하는 중…");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/connect/domain/status")
      .then((response) => response.json())
      .then((data: { message?: string; lookups?: Lookup[] }) => {
        setLookups(data.lookups ?? []);
        setLiveMessage(data.message ?? "공개 DNS를 읽었습니다.");
      })
      .catch(() => setLiveMessage("공개 DNS를 읽지 못했습니다."));
  }, []);

  const records = gabiaRecords(HOSTING_WAN_IPV4);
  const apexA = lookups.find((item) => item.kind === "A" && item.hostname === company.apex)?.values[0];
  const dnsOk = apexA === HOSTING_WAN_IPV4;

  return (
    <div className="flex min-h-[640px] flex-col bg-[#f1f3f4] lg:h-[calc(100dvh-3.25rem)]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <p className="text-sm font-semibold text-[#000092]">가비아 작업창 · DNS 설정</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          아래 가비아 DNS 관리툴에서 <span className="font-mono">{company.apex}</span> 를 열고 저장하세요. 문자 인증
          한도가 찬 작업창 로그인은 쓰지 않습니다. A(@)만{" "}
          <code className="font-mono">{HOSTING_WAN_IPV4}</code> 인지 확인하고, www · MX · SPF · NS 는 그대로 둡니다.
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

        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-5 ${
            dnsOk ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <p className="font-semibold">{dnsOk ? "공개 DNS는 목표 값과 같습니다" : "공개 DNS를 가비아에서 맞춰 주세요"}</p>
          <p className="mt-0.5">{liveMessage}</p>
          <p className="mt-0.5 font-mono">
            A {company.apex} → {apexA || "(없음)"} / 목표 {HOSTING_WAN_IPV4}
          </p>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                <th className="py-1 pr-3">호스트</th>
                <th className="py-1 pr-3">타입</th>
                <th className="py-1 pr-3">값</th>
                <th className="py-1">메모</th>
              </tr>
            </thead>
            <tbody>
              {TARGET_ROWS.map((row) => (
                <tr key={`${row.host}-${row.type}-${row.value}`} className="border-b border-slate-100">
                  <td className="py-1 pr-3 font-mono">{row.host}</td>
                  <td className="py-1 pr-3 font-mono">{row.type}</td>
                  <td className="py-1 pr-3 font-mono">{row.value}</td>
                  <td className="py-1 text-slate-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {records.slice(0, 2).map((record) => (
            <Button
              key={record.id}
              type="button"
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(gabiaCopyLine(record));
                setCopied(record.id);
                window.setTimeout(() => setCopied(""), 2000);
              }}
            >
              {copied === record.id ? "복사됨" : `${record.host} ${record.type} 복사`}
            </Button>
          ))}
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
