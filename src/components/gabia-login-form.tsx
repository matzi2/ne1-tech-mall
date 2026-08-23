"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GabiaPublicState } from "@/lib/gabia-types";

export function GabiaLoginForm() {
  const [state, setState] = useState<GabiaPublicState | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void hydrate();
  }, []);

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
    if (next.status === "ready" || next.status === "applied") setPassword("");
    setBusy(false);
  }

  async function apply() {
    setBusy(true);
    const response = await fetch("/api/connect/gabia/apply", { method: "POST" });
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
      {state?.message ? (
        <p className={`mt-2 text-sm font-medium ${ok ? "text-emerald-800" : "text-red-700"}`}>{state.message}</p>
      ) : null}
      {state?.applied?.length ? (
        <p className="mt-1 text-sm text-emerald-800">등록됨: {state.applied.join(", ")}</p>
      ) : null}

      {ok ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="navy" disabled={busy} onClick={apply}>
            DNS 다시 등록
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={start}>
            다시 로그인
          </Button>
        </div>
      ) : foreign ? (
        <form className="mt-4 space-y-3" onSubmit={verifyForeign}>
          <p className="text-sm font-semibold text-navy">해외 IP 추가 인증</p>
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
              휴대전화로 인증번호
            </Button>
            <Button type="button" variant="outline" disabled={busy || !password} onClick={() => sendForeign("ems")}>
              이메일로 인증번호
            </Button>
          </div>
          {state.foreignChannel ? (
            <p className="text-xs text-slate-600">
              {state.foreignChannel === "sms" ? "휴대전화" : "이메일"}로 보냈습니다.
            </p>
          ) : null}
          <div>
            <Label htmlFor="gabia-auth">인증번호</Label>
            <Input
              id="gabia-auth"
              className="mt-1"
              value={authKey}
              onChange={(event) => setAuthKey(event.target.value)}
              placeholder="받은 숫자"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="navy" disabled={busy || !authKey || !password}>
              인증하고 DNS 등록
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
