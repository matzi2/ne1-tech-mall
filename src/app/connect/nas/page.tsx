"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";
import { DOMAIN_STORAGE, defaultDnsSettings, type DnsSettings } from "@/lib/dns";
import { company } from "@/lib/company";
import {
  NAS_STORAGE,
  defaultNasSettings,
  gabiaACopyLine,
  ipv4Kind,
  nasCloneCommand,
  nasComposeUpCommand,
  nasLinks,
  nasReverseProxyRows,
  nasRouterForwards,
  nasSteps,
  type NasSettings,
} from "@/lib/nas";

type ProbeResult = {
  ready: boolean;
  ipv4?: string;
  kind?: string;
  message: string;
  probes: { port: number; open: boolean; detail: string }[];
};

const defaultChecks = nasSteps.map(() => false);

export default function NasConnectPage() {
  const [settings, setSettings] = useState<NasSettings>(defaultNasSettings);
  const [checks, setChecks] = useState<boolean[]>(defaultChecks);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState("");
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);

  const forwards = useMemo(() => nasRouterForwards(settings.lanIpv4), [settings.lanIpv4]);
  const proxies = useMemo(() => nasReverseProxyRows("127.0.0.1"), []);
  const publicKind = settings.publicIpv4.trim() ? ipv4Kind(settings.publicIpv4) : null;

  useEffect(() => {
    const stored = localStorage.getItem(NAS_STORAGE);
    if (stored) {
      setSettings({ ...defaultNasSettings, ...(JSON.parse(stored) as NasSettings) });
    }
    const storedChecks = localStorage.getItem(`${NAS_STORAGE}-checks`);
    if (storedChecks) {
      const next = JSON.parse(storedChecks) as boolean[];
      if (Array.isArray(next) && next.length === defaultChecks.length) setChecks(next);
    }
  }, []);

  function persist(next: NasSettings, nextChecks = checks) {
    localStorage.setItem(NAS_STORAGE, JSON.stringify(next));
    localStorage.setItem(`${NAS_STORAGE}-checks`, JSON.stringify(nextChecks));
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.nas = { reviewed: true, at: next.savedAt ?? new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    if (next.publicIpv4.trim()) {
      const dns = {
        ...defaultDnsSettings,
        ...(JSON.parse(localStorage.getItem(DOMAIN_STORAGE) || "{}") as DnsSettings),
        ipv4: next.publicIpv4.trim(),
        savedAt: next.savedAt,
      };
      localStorage.setItem(DOMAIN_STORAGE, JSON.stringify(dns));
    }
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

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    window.setTimeout(() => setCopied(""), 2000);
  }

  async function checkPorts() {
    setProbing(true);
    setProbe(null);
    try {
      const response = await fetch(`/api/connect/nas/status?ipv4=${encodeURIComponent(settings.publicIpv4.trim())}`);
      setProbe((await response.json()) as ProbeResult);
    } catch {
      setProbe({ ready: false, message: "이 작업 서버에서 포트를 확인하지 못했습니다.", probes: [] });
    } finally {
      setProbing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">SYNOLOGY · NAS</p>
        <h1 className="mt-1 text-2xl font-bold text-[#000092]">시놀로지 호스팅</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          회사 공인 IP → 공유기 → 시놀로지 순서입니다. 이 화면에서 값을 적고, DSM·공유기·가비아는 보스가 직접
          넣습니다. 비밀번호는 여기에 입력하지 마세요.
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <p>인터넷 → 회사 공인 IPv4 → 공유기 → 시놀로지(내부 IP) → 쇼핑몰 컨테이너 :43177</p>
          <p>HTTPS는 시놀로지 역방향 프록시가 담당합니다. 카페24 PHP 호스팅은 쓰지 않습니다.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={save}>
          <div>
            <Label htmlFor="publicIpv4">회사 공인 IPv4 (공유기 WAN)</Label>
            <Input
              id="publicIpv4"
              className="mt-1 font-mono text-sm"
              inputMode="decimal"
              placeholder="예: 211.xxx.xxx.xxx"
              value={settings.publicIpv4}
              onChange={(event) => setSettings({ ...settings, publicIpv4: event.target.value })}
            />
            {publicKind === "private" ? (
              <p className="mt-1 text-xs text-red-700">사설 IP입니다. 공유기 WAN 주소를 넣으세요.</p>
            ) : null}
            {publicKind === "cgnat" ? (
              <p className="mt-1 text-xs text-red-700">통신사 공유 IP입니다. 고정 공인 IP가 필요합니다.</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="lanIpv4">시놀로지 내부 IP</Label>
            <Input
              id="lanIpv4"
              className="mt-1 font-mono text-sm"
              inputMode="decimal"
              placeholder="예: 192.168.0.100"
              value={settings.lanIpv4}
              onChange={(event) => setSettings({ ...settings, lanIpv4: event.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">
              DSM → 제어판 → 정보 센터 또는 네트워크에서 확인합니다. 공유기 포트포워드 대상입니다.
            </p>
          </div>
          <div>
            <Label htmlFor="sharePath">소스 폴더 (File Station)</Label>
            <Input
              id="sharePath"
              className="mt-1 font-mono text-sm"
              value={settings.sharePath}
              onChange={(event) => setSettings({ ...settings, sharePath: event.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="navy">
              이 브라우저에 저장
            </Button>
            <Button type="button" variant="outline" onClick={checkPorts} disabled={probing || !settings.publicIpv4.trim()}>
              {probing ? "밖에서 확인 중…" : "80·443 밖에서 확인"}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/connect/domain">가비아 DNS</Link>
            </Button>
          </div>
          {saved ? <p className="text-sm text-emerald-700">공인 IP를 가비아 A 입력칸에도 같이 넣었습니다.</p> : null}
        </form>

        {probe ? (
          <div
            className={`mt-4 rounded-xl p-4 text-sm leading-6 ${
              probe.ready ? "border border-emerald-200 bg-emerald-50 text-emerald-950" : "border border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p className="font-semibold">{probe.ready ? "포트 열림" : "아직 닫힘"}</p>
            <p>{probe.message}</p>
            {probe.probes.length ? (
              <ul className="mt-2 font-mono text-xs">
                {probe.probes.map((item) => (
                  <li key={item.port}>
                    {item.port}: {item.open ? "열림" : "닫힘"} · {item.detail}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <h2 className="mt-8 text-lg font-semibold text-[#000092]">순서</h2>
        <ol className="mt-3 space-y-2">
          {nasSteps.map((step, index) => (
            <li key={step.id} className="flex items-start gap-3 text-sm leading-6">
              <input type="checkbox" className="mt-1" checked={checks[index] ?? false} onChange={() => toggleCheck(index)} />
              <span>
                <span className="font-semibold text-[#000092]">
                  {index + 1}. {step.title}
                </span>
                <span className="mt-0.5 block text-slate-600">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <h2 className="mt-8 text-lg font-semibold text-[#000092]">공유기 포트포워드</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">프로토콜</th>
                <th className="py-2 pr-3">외부 포트</th>
                <th className="py-2 pr-3">내부</th>
                <th className="py-2">용도</th>
              </tr>
            </thead>
            <tbody>
              {forwards.map((row) => (
                <tr key={row.wan} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-mono">{row.proto}</td>
                  <td className="py-2 pr-3 font-mono">{row.wan}</td>
                  <td className="py-2 pr-3 font-mono">{row.lan}</td>
                  <td className="py-2 text-slate-600">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-lg font-semibold text-[#000092]">시놀로지 역방향 프록시</h2>
        <p className="mt-1 text-xs text-slate-500">제어판 → 로그인 포털 → 고급 → 역방향 프록시 → 생성</p>
        <ul className="mt-3 space-y-2 text-sm">
          {proxies.map((row) => (
            <li key={row.id} className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="font-medium text-[#000092]">{row.note}</p>
              <p className="font-mono text-xs">소스 {row.source}</p>
              <p className="font-mono text-xs">대상 {row.dest}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-[#000092]">복사해서 넣는 값</h2>
        <div className="mt-3 space-y-2">
          {[
            { id: "gabia", label: "가비아 A", text: gabiaACopyLine(settings.publicIpv4) },
            { id: "clone", label: "SSH clone", text: nasCloneCommand(settings.sharePath) },
            { id: "up", label: "컨테이너 실행", text: nasComposeUpCommand(settings.sharePath) },
          ].map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-[#0046CA]">{item.label}</p>
                <p className="break-all font-mono text-xs text-slate-700">{item.text}</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => copyText(item.id, item.text)}>
                {copied === item.id ? "복사됨" : "복사"}
              </Button>
            </div>
          ))}
        </div>

        <ul className="mt-6 space-y-2">
          {nasLinks.map((item) => (
            <li key={item.id}>
              <a href={item.href} className="break-all text-sm text-[#0046CA] underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-slate-500">
          빌드 중 메모리가 부족하면 PC에서 <code>docker compose build</code> 한 뒤 이미지를 NAS로 옮기면 됩니다. 도메인{" "}
          {company.domain}
        </p>
      </div>
    </div>
  );
}
