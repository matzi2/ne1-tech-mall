"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";
import { company } from "@/lib/company";
import {
  DOMAIN_STORAGE,
  defaultDnsSettings,
  domainPlan,
  plannedRecords,
  type DnsSettings,
} from "@/lib/dns";

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

export default function DomainConnectPage() {
  const [settings, setSettings] = useState<DnsSettings>(defaultDnsSettings);
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const records = useMemo(() => plannedRecords(settings), [settings]);

  useEffect(() => {
    const stored = localStorage.getItem(DOMAIN_STORAGE);
    if (stored) {
      setSettings({ ...defaultDnsSettings, ...(JSON.parse(stored) as DnsSettings) });
    }
    fetch("/api/connect/domain/status")
      .then((response) => response.json())
      .then((next: DomainStatus) => setStatus(next))
      .catch(() => setError("DNS 조회를 하지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  function save(event: React.FormEvent) {
    event.preventDefault();
    const next = { ...settings, savedAt: new Date().toISOString() };
    localStorage.setItem(DOMAIN_STORAGE, JSON.stringify(next));
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.domain = { reviewed: true, at: next.savedAt };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    setSettings(next);
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">DOMAIN · DNS</p>
        <h1 className="mt-1 text-2xl font-bold text-[#000092]">{company.domain}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          공식 주소는 {company.siteUrl} 입니다. 등록기관에 아래 DNS를 넣으면 쇼핑몰이 이 도메인으로
          열립니다. www는 루트로 붙입니다. 메일은 {company.email}, {company.supportEmail} 입니다.
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <p>루트: {domainPlan.apex}</p>
          <p>
            www: {domainPlan.www} → {company.dns.wwwTarget}
          </p>
          <p>메일: {domainPlan.emails.join(" · ")}</p>
          <p>SPF: {company.dns.spf}</p>
          <p>
            상태:{" "}
            {loading ? "DNS 조회 중…" : status?.message || error || "조회 결과 없음"}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={save}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="registrar">등록기관</Label>
              <Input
                id="registrar"
                className="mt-1"
                placeholder="가비아"
                value={settings.registrar}
                onChange={(event) => setSettings({ ...settings, registrar: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ns">네임서버</Label>
              <Input
                id="ns"
                className="mt-1 font-mono text-sm"
                placeholder="ns.gabia.co.kr, ns1.gabia.co.kr, ns.gabia.net"
                value={settings.nameservers}
                onChange={(event) => setSettings({ ...settings, nameservers: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ipv4">A 레코드 IPv4</Label>
              <Input
                id="ipv4"
                className="mt-1 font-mono text-sm"
                placeholder="호스팅 서버 IP"
                value={settings.ipv4}
                onChange={(event) => setSettings({ ...settings, ipv4: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="www">www CNAME</Label>
              <Input
                id="www"
                className="mt-1 font-mono text-sm"
                value={settings.wwwTarget}
                onChange={(event) => setSettings({ ...settings, wwwTarget: event.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="mx">MX (메일)</Label>
              <Input
                id="mx"
                className="mt-1 font-mono text-sm"
                placeholder="10 aspmx.daum.net"
                value={settings.mx}
                onChange={(event) => setSettings({ ...settings, mx: event.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="navy">
              DNS 정보 저장
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLoading(true);
                setError("");
                fetch("/api/connect/domain/status")
                  .then((response) => response.json())
                  .then((next: DomainStatus) => setStatus(next))
                  .catch(() => setError("DNS 조회를 하지 못했습니다."))
                  .finally(() => setLoading(false));
              }}
            >
              다시 조회
            </Button>
          </div>
          {saved ? <p className="text-sm text-emerald-700">이 브라우저에 DNS 정보를 저장했습니다.</p> : null}
        </form>

        <h2 className="mt-8 text-lg font-semibold text-[#000092]">등록할 DNS 레코드</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">호스트</th>
                <th className="py-2 pr-3">유형</th>
                <th className="py-2 pr-3">값</th>
                <th className="py-2 pr-3">TTL</th>
                <th className="py-2">설명</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.type}-${record.host}-${record.note}`} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-mono">{record.host}</td>
                  <td className="py-2 pr-3 font-semibold">{record.type}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{record.value}</td>
                  <td className="py-2 pr-3 text-slate-500">{record.ttl}</td>
                  <td className="py-2 text-slate-600">{record.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {status?.lookups?.length ? (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-[#000092]">현재 조회 결과</h2>
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
      </div>
    </div>
  );
}
