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
  dsmHref,
  parseNasHost,
  NAS_DEFAULT_ADDRESS,
  NAS_DEFAULT_USERNAME,
  NAS_QUICKCONNECT_URL,
  type NasSettings,
  type NasFileEntry,
  type NasSessionPublic,
} from "@/lib/nas";

const DEFAULT_HREF = NAS_QUICKCONNECT_URL;

const PAGES = [
  { id: "dsm", label: "QuickConnect DSM", href: NAS_QUICKCONNECT_URL },
  { id: "webdav", label: "WebDAV", href: "https://matzi57.synology.me:5006/" },
] as const;

type ProbeResult = {
  ready: boolean;
  ipv4?: string;
  kind?: string;
  message: string;
  probes: { port: number; open: boolean; detail: string }[];
};

const defaultChecks = nasSteps.map(() => false);

export function NasDesk() {
  const [tab, setTab] = useState<"window" | "setup">("window");
  const [page, setPage] = useState<(typeof PAGES)[number]>(PAGES[0]);
  const [stamp, setStamp] = useState(0);
  const [frameSrc, setFrameSrc] = useState(DEFAULT_HREF);
  const [loginHost, setLoginHost] = useState(NAS_DEFAULT_ADDRESS);
  const [loginUser, setLoginUser] = useState(NAS_DEFAULT_USERNAME);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [session, setSession] = useState<NasSessionPublic | null>(null);
  const [files, setFiles] = useState<NasFileEntry[]>([]);
  const [fileMessage, setFileMessage] = useState("");
  const [settings, setSettings] = useState<NasSettings>(defaultNasSettings);
  const [checks, setChecks] = useState<boolean[]>(defaultChecks);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState("");
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);

  const forwards = useMemo(() => nasRouterForwards(settings.lanIpv4), [settings.lanIpv4]);
  const proxies = useMemo(() => nasReverseProxyRows("127.0.0.1"), []);
  const publicKind = settings.publicIpv4.trim() ? ipv4Kind(settings.publicIpv4) : null;
  const address = loginHost.trim() ? dsmHref(loginHost) : frameSrc;

  useEffect(() => {
    fetch("/api/connect/nas/login")
      .then((response) => response.json())
      .then((next: NasSessionPublic) => {
        setSession(next);
        if (next.host) {
          const parsed = parseNasHost(next.port ? `${next.host}:${next.port}` : next.host);
          const address = parsed?.quickConnectId
            ? `http://QuickConnect.to/${parsed.quickConnectId}`
            : next.port && next.port !== 443 && next.port !== 80
              ? `${next.host}:${next.port}`
              : next.host;
          setLoginHost(address);
          setFrameSrc(dsmHref(address));
        }
        if (next.username) setLoginUser(next.username);
        if (next.connected) {
          fetch("/api/connect/nas/files")
            .then((response) => response.json())
            .then((data: { files?: NasFileEntry[]; message?: string }) => {
              setFiles(data.files ?? []);
              setFileMessage(data.message ?? "");
            })
            .catch(() => undefined);
        }
      })
      .catch(() => undefined);
    const stored = localStorage.getItem(NAS_STORAGE);
    if (stored) {
      const next = { ...defaultNasSettings, ...(JSON.parse(stored) as NasSettings) };
      setSettings(next);
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

  function openAddress(raw = loginHost) {
    const href = raw.trim() ? dsmHref(raw) : page.href;
    setFrameSrc(href);
    setStamp(Date.now());
    setTab("window");
  }

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginBusy(true);
    openAddress();
    try {
      const response = await fetch("/api/connect/nas/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: loginHost,
          username: loginUser,
          password: loginPassword,
          otp: loginOtp,
        }),
      });
      const next = (await response.json()) as NasSessionPublic;
      setSession(next);
      if (next.connected) {
        setLoginPassword("");
        setLoginOtp("");
        const stored = {
          ...settings,
          publicIpv4: settings.publicIpv4 || (/^\d{1,3}(\.\d{1,3}){3}$/.test(next.host) ? next.host : settings.publicIpv4),
          savedAt: new Date().toISOString(),
        };
        persist(stored);
        setSettings(stored);
        const listed = (await fetch("/api/connect/nas/files").then((item) => item.json())) as {
          files?: NasFileEntry[];
          message?: string;
        };
        setFiles(listed.files ?? []);
        setFileMessage(listed.message ?? "");
      }
    } catch {
      setSession({
        connected: false,
        host: loginHost,
        port: 5001,
        protocol: "https",
        username: loginUser,
        lastMessage: "로그인 요청을 보내지 못했습니다.",
      });
    } finally {
      setLoginBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[640px] flex-col bg-[#f1f3f4]">
      <div className="shrink-0 border-b border-[#dadce0] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#000092]">시놀로지 접속 창</p>
            <p className="mt-0.5 text-xs text-slate-500">
              주소는 {NAS_QUICKCONNECT_URL} 입니다. 2단계 인증이면 OTP를 이 창에만 넣으세요. Docker 설치 마법사가 보이면
              공유 폴더 docker · volume1 로 완료하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant={tab === "window" ? "navy" : "outline"} onClick={() => setTab("window")}>
              접속 창
            </Button>
            <Button type="button" size="sm" variant={tab === "setup" ? "navy" : "outline"} onClick={() => setTab("setup")}>
              호스팅 순서
            </Button>
          </div>
        </div>

        <form className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]" onSubmit={submitLogin}>
          <div className="flex h-10 items-center gap-2 rounded-full bg-[#e8eaed] px-3">
            <span className="shrink-0 text-[11px] font-semibold text-[#5f6368]">주소</span>
            <input
              className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none"
              autoComplete="off"
              placeholder={NAS_QUICKCONNECT_URL}
              value={loginHost}
              onChange={(event) => setLoginHost(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => openAddress()}>
              창에 열기
            </Button>
            <Button
              type="button"
              size="sm"
              variant={page.id === "dsm" ? "navy" : "outline"}
              onClick={() => {
                setPage(PAGES[0]);
                setLoginHost(NAS_QUICKCONNECT_URL);
                setFrameSrc(NAS_QUICKCONNECT_URL);
                setStamp(Date.now());
                setTab("window");
              }}
            >
              QuickConnect
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setStamp(Date.now())}>
              새로고침
            </Button>
          </div>
          <Input
            className="h-10"
            autoComplete="username"
            placeholder="DSM 아이디"
            value={loginUser}
            onChange={(event) => setLoginUser(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Input
              className="h-10 min-w-[160px] flex-1"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
            />
            <Input
              className="h-10 min-w-[120px] flex-1"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="OTP"
              value={loginOtp}
              onChange={(event) => setLoginOtp(event.target.value.replace(/\D/g, "").slice(0, 8))}
            />
            <Button type="submit" variant="navy" disabled={loginBusy}>
              {loginBusy ? "접속 확인 중…" : "이 계정으로 접속"}
            </Button>
          </div>
        </form>
        <p className="mt-2 truncate font-mono text-xs text-slate-500">{address}</p>
        {session ? (
          <p className={`mt-1 text-xs ${session.connected && !session.needOtp ? "text-emerald-700" : "text-amber-800"}`}>{session.lastMessage}</p>
        ) : null}
        {session?.needOtp ? (
          <p className="mt-1 text-xs font-medium text-amber-900">
            인증 앱의 6자리 숫자를 OTP 칸에만 넣고 다시 접속하세요. 채팅에는 넣지 마세요.
          </p>
        ) : null}
      </div>

      {tab === "window" ? (
        <div className="flex min-h-0 flex-1 flex-col bg-white">
          {session?.connected && files.length ? (
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-[#000092]">파일 목록</p>
              <p className="font-mono text-xs text-slate-500">{fileMessage}</p>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {files.map((item) => (
                  <li key={item.href} className="truncate rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                    {item.collection ? "폴더" : "파일"} · {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <iframe
            key={`${frameSrc}-${stamp}`}
            title="시놀로지 접속 창"
            src={frameSrc}
            className="min-h-0 w-full flex-1 border-0 bg-white"
            referrerPolicy="no-referrer-when-downgrade"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto bg-white px-4 py-6">
          <NasSetupPanel
            settings={settings}
            setSettings={setSettings}
            checks={checks}
            setChecks={setChecks}
            persist={persist}
            saved={saved}
            setSaved={setSaved}
            copied={copied}
            copyText={async (id, text) => {
              await navigator.clipboard.writeText(text);
              setCopied(id);
              window.setTimeout(() => setCopied(""), 2000);
            }}
            probe={probe}
            probing={probing}
            checkPorts={async () => {
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
            }}
            forwards={forwards}
            proxies={proxies}
            publicKind={publicKind}
          />
        </div>
      )}

      <div className="shrink-0 border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-950">
        채팅에 비밀번호·OTP를 붙여 넣지 마세요. DSM은 QuickConnect로 들어갑니다. SSH(22)·DSM(5000·5001)은 인터넷에 상시로 열지 않는 것이 좋습니다.{" "}
        {company.domain}
      </div>
    </div>
  );
}

function NasSetupPanel({
  settings,
  setSettings,
  checks,
  setChecks,
  persist,
  saved,
  setSaved,
  copied,
  copyText,
  probe,
  probing,
  checkPorts,
  forwards,
  proxies,
  publicKind,
}: {
  settings: NasSettings;
  setSettings: (next: NasSettings) => void;
  checks: boolean[];
  setChecks: (next: boolean[]) => void;
  persist: (next: NasSettings, nextChecks?: boolean[]) => void;
  saved: boolean;
  setSaved: (next: boolean) => void;
  copied: string;
  copyText: (id: string, text: string) => Promise<void>;
  probe: ProbeResult | null;
  probing: boolean;
  checkPorts: () => Promise<void>;
  forwards: ReturnType<typeof nasRouterForwards>;
  proxies: ReturnType<typeof nasReverseProxyRows>;
  publicKind: ReturnType<typeof ipv4Kind> | null;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const next = { ...settings, savedAt: new Date().toISOString() };
          persist(next);
          setSettings(next);
          setSaved(true);
        }}
      >
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
          {publicKind === "private" ? <p className="mt-1 text-xs text-red-700">사설 IP입니다. 공유기 WAN 주소를 넣으세요.</p> : null}
          {publicKind === "cgnat" ? <p className="mt-1 text-xs text-red-700">통신사 공유 IP입니다. 고정 공인 IP가 필요합니다.</p> : null}
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
        </div>
      ) : null}

      <h2 className="mt-8 text-lg font-semibold text-[#000092]">순서</h2>
      <ol className="mt-3 space-y-2">
        {nasSteps.map((step, index) => (
          <li key={step.id} className="flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              className="mt-1"
              checked={checks[index] ?? false}
              onChange={() => {
                const next = checks.map((item, i) => (i === index ? !item : item));
                setChecks(next);
                persist({ ...settings, savedAt: settings.savedAt ?? new Date().toISOString() }, next);
              }}
            />
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
    </div>
  );
}
