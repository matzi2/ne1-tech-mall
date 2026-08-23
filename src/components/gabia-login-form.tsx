"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOSTING_WAN_IPV4 } from "@/lib/hosting";
import type { GabiaPublicState } from "@/lib/gabia-types";

function formatCheckedAt(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function resultTone(state: GabiaPublicState) {
  if (state.status === "ready" || state.status === "applied" || state.lastAction === "dns_ok") {
    return "border-emerald-300 bg-emerald-50 text-emerald-900";
  }
  if (state.lastAction === "sms_sent" || state.lastAction === "email_sent" || state.lastAction === "verify_ok") {
    return "border-sky-300 bg-sky-50 text-sky-950";
  }
  if (state.lastAction === "verify_fail" || state.lastAction === "dns_fail" || state.status === "error") {
    return "border-red-300 bg-red-50 text-red-800";
  }
  return "border-amber-200 bg-white text-slate-800";
}

function actionLabel(state: GabiaPublicState) {
  switch (state.lastAction) {
    case "sms_sent":
      return "휴대전화로 인증번호를 보냈습니다";
    case "email_sent":
      return "이메일로 인증번호를 보냈습니다";
    case "verify_ok":
      return "인증번호 확인됨";
    case "verify_fail":
      return "인증번호 확인 실패 · DNS 미등록";
    case "dns_ok":
      return "DNS 등록 완료";
    case "dns_fail":
      return "DNS 등록 실패";
    case "login":
      return "로그인 진행 중";
    default:
      return "대기";
  }
}

function ResultBanner({ state }: { state: GabiaPublicState }) {
  const checked = formatCheckedAt(state.lastCheckedAt);
  return (
    <div className={`rounded-lg border px-3 py-3 ${resultTone(state)}`}>
      <p className="text-xs font-semibold tracking-wide uppercase">{actionLabel(state)}</p>
      {checked ? <p className="mt-1 text-xs">마지막 확인 {checked}</p> : null}
      <p className="mt-1 text-base font-semibold leading-6">{state.message || "진행 결과를 여기에 표시합니다."}</p>
      {state.applied?.length ? <p className="mt-1 text-sm">등록됨: {state.applied.join(", ")}</p> : null}
      {state.sendCount > 0 ? <p className="mt-1 text-xs">문자 발송 {state.sendCount}회 · 마지막 문자만 유효</p> : null}
    </div>
  );
}

export function GabiaLoginForm() {
  const [state, setState] = useState<GabiaPublicState | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [busy, setBusy] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void hydrate();
  }, []);

  useEffect(() => {
    if (state?.lastCheckedAt) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state?.lastCheckedAt, state?.lastAction]);

  async function hydrate() {
    setBusy(true);
    const current = (await (await fetch("/api/connect/gabia/status")).json()) as GabiaPublicState;
    if (current.status === "foreign" || current.status === "ready" || current.status === "applied") {
      setState(current);
      if (current.userId) setUserId(current.userId);
      setBusy(false);
      return;
    }
    await start();
  }

  async function start() {
    setBusy(true);
    const response = await fetch("/api/connect/gabia/init", { method: "POST" });
    setState((await response.json()) as GabiaPublicState);
    setCaptchaValue("");
    setAuthKey("");
    setBusy(false);
  }

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/connect/gabia/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password, captchaValue }),
    });
    const next = (await response.json()) as GabiaPublicState;
    setState(next);
    if (next.status !== "foreign") {
      setPassword("");
      setCaptchaValue("");
    }
    setBusy(false);
  }

  async function sendForeign(channel: "sms" | "ems") {
    setBusy(true);
    const response = await fetch("/api/connect/gabia/foreign/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password, channel }),
    });
    setState((await response.json()) as GabiaPublicState);
    setAuthKey("");
    setBusy(false);
  }

  async function verifyForeign(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/connect/gabia/foreign/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password, authKey, captchaValue }),
    });
    const next = (await response.json()) as GabiaPublicState;
    setState(next);
    setAuthKey("");
    if (next.status === "ready" || next.status === "applied") setPassword("");
    if (next.lastAction === "verify_fail") setAuthKey("");
    setBusy(false);
  }

  async function apply() {
    setBusy(true);
    const response = await fetch("/api/connect/gabia/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipv4: HOSTING_WAN_IPV4 }),
    });
    setState((await response.json()) as GabiaPublicState);
    setBusy(false);
  }

  const ok = state?.status === "ready" || state?.status === "applied";
  const foreign = state?.status === "foreign";

  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-navy">가비아 로그인 · DNS 등록</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">
        이 작업 서버는 한국 밖입니다. 아이디·보안 문자가 맞아도 가비아가 휴대전화/이메일 추가 인증을 요구할 수 있습니다.
      </p>
      {state ? (
        <div ref={resultRef} className="mt-3">
          <ResultBanner state={state} />
        </div>
      ) : null}

      {ok ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="navy" disabled={busy} onClick={apply}>
            A 레코드 등록 · {HOSTING_WAN_IPV4}
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={start}>
            다시 로그인
          </Button>
        </div>
      ) : foreign ? (
        <form className="mt-4 space-y-3" onSubmit={verifyForeign}>
          <p className="text-sm font-semibold text-navy">해외 IP 추가 인증</p>
          <p className="text-sm text-slate-700">
            가비아 등록 휴대전화 {state.phoneMasked ?? "(확인 중)"} · 메일 {state.emailMasked ?? "(확인 중)"}
          </p>
          <p className="text-sm leading-6 text-slate-700">
            {state.lastAction === "verify_fail"
              ? `가비아가 숫자를 거절했습니다. ${state.sendCount}번째까지 보낸 문자 중 예전 번호는 무효입니다. 비밀번호를 넣고 [휴대전화로 인증번호 다시 받기]를 누른 다음, 새로 온 문자 숫자만 넣으세요.`
              : state.hasForeignToken
                ? `인증번호가 준비됐습니다. ${state.sendCount}번째로 받은 문자의 숫자만 넣으세요. 이전 문자는 쓰지 마세요.`
                : "이전에 받은 인증번호는 쓸 수 없습니다. 비밀번호를 넣고 인증번호를 다시 받으세요."}
          </p>
          <div>
            <Label htmlFor="gabia-id-f">가비아 아이디</Label>
            <Input id="gabia-id-f" className="mt-1" value={userId} onChange={(event) => setUserId(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="gabia-pw-f">비밀번호</Label>
            <Input
              id="gabia-pw-f"
              className="mt-1"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="navy" disabled={busy || !password} onClick={() => sendForeign("sms")}>
              휴대전화로 인증번호 다시 받기
            </Button>
            <Button type="button" variant="outline" disabled={busy || !password} onClick={() => sendForeign("ems")}>
              이메일로 인증번호
            </Button>
          </div>
          {state.foreignChannel ? (
            <p className="text-xs text-slate-600">
              마지막 발송: {state.foreignChannel === "sms" ? "휴대전화" : "이메일"}
              {state.hasForeignToken ? " · 확인 준비됨" : " · 확인 토큰 없음, 다시 받아 주세요"}
            </p>
          ) : null}
          <div>
            <Label htmlFor="gabia-auth">인증번호</Label>
            <Input
              id="gabia-auth"
              className="mt-1"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={authKey}
              onChange={(event) => setAuthKey(event.target.value.replace(/\D/g, ""))}
              placeholder="마지막 문자에 적힌 숫자"
            />
          </div>
          <ResultBanner state={state} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="navy" disabled={busy || !authKey || !password || !state.hasForeignToken}>
              {busy ? "가비아에 확인 중…" : "인증하고 DNS 등록"}
            </Button>
            <Button type="button" variant="outline" disabled={busy} onClick={start}>
              처음부터
            </Button>
          </div>
        </form>
      ) : (
        <form className="mt-4 space-y-3" onSubmit={login}>
          <div>
            <Label htmlFor="gabia-id">가비아 아이디</Label>
            <Input
              id="gabia-id"
              className="mt-1"
              autoComplete="username"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gabia-pw">비밀번호</Label>
            <Input
              id="gabia-pw"
              className="mt-1"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gabia-captcha">보안 문자</Label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {state?.captchaSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={state.captchaSrc} alt="가비아 보안 문자" width={190} height={69} className="rounded border bg-white" />
              ) : (
                <p className="text-xs text-slate-500">보안 문자를 불러오는 중…</p>
              )}
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={start}>
                새로고침
              </Button>
            </div>
            <Input
              id="gabia-captcha"
              className="mt-2"
              value={captchaValue}
              onChange={(event) => setCaptchaValue(event.target.value)}
              placeholder="그림에 보이는 글자"
            />
          </div>
          <Button type="submit" variant="navy" disabled={busy || !userId || !password || !captchaValue}>
            로그인하고 DNS 등록
          </Button>
        </form>
      )}
    </div>
  );
}
