"use client";

import { useEffect, useMemo, useState } from "react";
import { GabiaLoginForm } from "@/components/gabia-login-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";
import { company } from "@/lib/company";
import { DOMAIN_STORAGE, defaultDnsSettings, domainPlan, type DnsSettings } from "@/lib/dns";
import {
  GABIA_CHECKLIST_STORAGE,
  gabiaConsole,
  gabiaCopyLine,
  gabiaLinks,
  gabiaRecords,
  type GabiaRecord,
} from "@/lib/gabia";

type Lookup = {
  kind: string;
  hostname: string;
  values: string[];
  error?: string;
};

type DomainStatus = {
  live: boolean;
  message: string;
  lookups: Lookup[];
};

const defaultChecks = gabiaConsole.steps.map(() => false);

export default function DomainConnectPage() {
  const [settings, setSettings] = useState<DnsSettings>(defaultDnsSettings);
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [copiedLink, setCopiedLink] = useState("");
  const [checks, setChecks] = useState<boolean[]>(defaultChecks);

  const records = useMemo(() => gabiaRecords(settings.ipv4), [settings.ipv4]);

  useEffect(() => {
    const stored = localStorage.getItem(DOMAIN_STORAGE);
    if (stored) {
      setSettings({ ...defaultDnsSettings, ...(JSON.parse(stored) as DnsSettings) });
    }
    const storedChecks = localStorage.getItem(GABIA_CHECKLIST_STORAGE);
    if (storedChecks) {
      const next = JSON.parse(storedChecks) as boolean[];
      if (Array.isArray(next) && next.length === defaultChecks.length) setChecks(next);
    }
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    setError("");
    fetch("/api/connect/domain/status")
      .then((response) => response.json())
      .then((next: DomainStatus) => setStatus(next))
      .catch(() => setError("DNS 조회를 하지 못했습니다."))
      .finally(() => setLoading(false));
  }

  function persist(next: DnsSettings, nextChecks = checks) {
    localStorage.setItem(DOMAIN_STORAGE, JSON.stringify(next));
    localStorage.setItem(GABIA_CHECKLIST_STORAGE, JSON.stringify(nextChecks));
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.domain = { reviewed: true, at: next.savedAt ?? new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    const next = { ...settings, savedAt: new Date().toISOString() };
    persist(next);
    setSettings(next);
    setSaved(true);
  }

  function toggleCheck(index: number) {
    const next = checks.map((item, i) => (i === index ? !item : item));
    setChecks(next);
    persist({ ...settings, savedAt: settings.savedAt ?? new Date().toISOString() }, next);
  }

  async function copyRecord(record: GabiaRecord) {
    const text = gabiaCopyLine(record);
    await navigator.clipboard.writeText(text);
    setCopied(record.id);
    window.setTimeout(() => setCopied(""), 2000);
  }

  const wwwLive = status?.lookups.some((item) => item.kind === "CNAME" && item.values.length > 0);
  const aLive = Boolean(status?.live);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">GABIA · DNS</p>
        <h1 className="mt-1 text-2xl font-bold text-[#000092]">{gabiaConsole.name}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{gabiaConsole.notice}</p>

        <ul className="mt-4 space-y-2">
          {gabiaLinks.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-[#0046CA]/20 bg-[#0046CA]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-[#0046CA]">{item.label}</p>
                <a href={item.href} className="break-all font-mono text-sm text-[#000092] underline">
                  {item.href}
                </a>
              </div>
              <Button
                type="button"
                size="sm"
                variant="navy"
                onClick={async () => {
                  await navigator.clipboard.writeText(item.href);
                  setCopiedLink(item.id);
                  window.setTimeout(() => setCopiedLink(""), 2000);
                }}
              >
                {copiedLink === item.id ? "복사됨" : "주소 복사"}
              </Button>
            </li>
          ))}
        </ul>

        <GabiaLoginForm />

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <p>도메인: {gabiaConsole.domain}</p>
          <p>등록기관: {company.dns.registrar}</p>
          <p>네임서버: {company.dns.nameservers}</p>
          <p>
            상태: {loading ? "DNS 조회 중…" : status?.message || error || "조회 결과 없음"}
          </p>
          <p>
            A: {aLive ? "있음" : "없음"} · www CNAME: {wwwLive ? "있음" : "없음"} · MX/SPF: 있음
          </p>
        </div>

        <ol className="mt-6 space-y-2">
          {gabiaConsole.steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1"
                checked={checks[index] ?? false}
                onChange={() => toggleCheck(index)}
              />
              <span>
                <span className="font-semibold text-[#000092]">{index + 1}.</span> {step}
              </span>
            </li>
          ))}
        </ol>

        <form className="mt-6 space-y-4" onSubmit={save}>
          <div>
            <Label htmlFor="ipv4">A 레코드 IPv4 (호스팅 IP)</Label>
            <Input
              id="ipv4"
              className="mt-1 font-mono text-sm"
              placeholder="정해지면 숫자 IP만 입력"
              value={settings.ipv4}
              onChange={(event) => setSettings({ ...settings, ipv4: event.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">
              IP가 없으면 A는 보류합니다. www CNAME은 지금 가비아에 넣을 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="navy">
              작업 내용 저장
            </Button>
            <Button type="button" variant="outline" onClick={refresh}>
              공개 DNS 다시 조회
            </Button>
          </div>
          {saved ? <p className="text-sm text-emerald-700">이 브라우저에 가비아 작업 내용을 저장했습니다.</p> : null}
        </form>

        <h2 className="mt-8 text-lg font-semibold text-[#000092]">가비아에 넣을 레코드</h2>
        <p className="mt-1 text-xs text-slate-500">
          CNAME·MX 값은 가비아 안내에 따라 끝 마침표(.)를 포함합니다. 이미 있는 MX/SPF/NS는 다시 넣지 마세요.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">상태</th>
                <th className="py-2 pr-3">호스트</th>
                <th className="py-2 pr-3">타입</th>
                <th className="py-2 pr-3">값</th>
                <th className="py-2 pr-3">우선순위</th>
                <th className="py-2">복사</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-3">
                    <span
                      className={
                        record.action === "keep"
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                          : record.action === "add"
                            ? "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800"
                            : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
                      }
                    >
                      {record.action === "keep" ? "이미 적용" : record.action === "add" ? "추가" : "IP 대기"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono">{record.host}</td>
                  <td className="py-2 pr-3 font-semibold">{record.type}</td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {record.value || "(호스팅 IPv4)"}
                    <p className="mt-1 font-sans text-xs font-normal text-slate-500">{record.note}</p>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{record.priority ?? "—"}</td>
                  <td className="py-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => copyRecord(record)}>
                      {copied === record.id ? "복사됨" : "복사"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <p className="font-semibold">지금 가비아에서 할 일</p>
          <p>
            1) 호스트 <code>www</code> · 타입 <code>CNAME</code> · 값 <code>{company.dns.wwwTarget}.</code> 추가 후
            저장
          </p>
          <p>
            2) 호스팅 IP가 있으면 호스트 <code>@</code> · 타입 <code>A</code> · 그 IP를 추가 후 저장
          </p>
          <p>3) MX·TXT·NS는 이미 가비아/Daum 값이 있으니 손대지 않습니다.</p>
        </div>

        {status?.lookups?.length ? (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-[#000092]">공개 DNS 조회</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {status.lookups.map((item) => (
                <li key={`${item.kind}-${item.hostname}`} className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-mono text-xs text-slate-500">
                    {item.kind} {item.hostname}
                  </span>
                  <p className="mt-1 font-mono text-xs">
                    {item.values.length ? item.values.join(" · ") : item.error || "레코드 없음"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-slate-500">
          가비아 안내: 반영까지 네트워크에 따라 최대 48시간이 걸릴 수 있습니다. 메일{" "}
          {domainPlan.emails.join(" · ")}
        </p>
      </div>
    </div>
  );
}
