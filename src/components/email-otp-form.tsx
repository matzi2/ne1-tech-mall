"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoAccounts, isAdmin, isAdminEmail, type Role } from "@/lib/company";
import type { SessionUser } from "@/components/app-providers";

type StartResponse = {
  ok: boolean;
  email?: string;
  oneTimePassword?: string;
  expiresAt?: string;
  message?: string;
};

type VerifyResponse = {
  ok: boolean;
  user?: SessionUser;
  message?: string;
};

export function EmailOtpForm({
  initialEmail = "",
  name,
  role,
  next = "/mypage",
  submitLabel = "1회용 비밀번호 받기",
}: {
  initialEmail?: string;
  name?: string;
  role?: Role;
  next?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const { applySession } = useApp();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  async function requestOtp(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/otp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });
      const data = (await response.json()) as StartResponse;
      if (!data.ok) {
        setError(data.message ?? "1회용 비밀번호를 만들지 못했습니다.");
        return;
      }
      setOtp(data.oneTimePassword ?? "");
      setExpiresAt(data.expiresAt ?? "");
      setStep("code");
    } catch {
      setError("1회용 비밀번호를 요청하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = (await response.json()) as VerifyResponse;
      if (!data.ok || !data.user) {
        setError(data.message ?? "확인에 실패했습니다.");
        return;
      }
      applySession(data.user);
      const blocked = !isAdmin(data.user) && (next.startsWith("/admin") || next.startsWith("/connect"));
      if (blocked) {
        router.push("/mypage");
      } else if (isAdmin(data.user) && next === "/mypage") {
        router.push("/admin");
      } else {
        router.push(next);
      }
    } catch {
      setError("확인에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <form className="space-y-4" onSubmit={verify}>
        <p className="text-sm leading-6 text-slate-600">
          <strong>{email}</strong> 로 쓸 1회용 비밀번호입니다. 비밀번호는 서버에 저장하지 않으며, 한 번만
          유효합니다. 확인 후에는 이 브라우저에서 로그인이 유지됩니다.
        </p>
        <div className="rounded-xl bg-[#0d1117] px-4 py-6 text-center text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">one-time password</p>
          <p className="mt-2 select-all font-mono text-3xl font-bold tracking-[0.3em]">{otp || "------"}</p>
          {expiresAt ? (
            <p className="mt-2 text-xs text-white/50">
              {new Date(expiresAt).toLocaleTimeString("ko-KR")} 까지
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="otp">1회용 비밀번호</Label>
          <Input
            id="otp"
            className="mt-1 font-mono tracking-[0.3em]"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={busy || code.length < 6}>
          확인하고 로그인 유지
        </Button>
        <button type="button" className="w-full text-sm text-slate-500" onClick={() => setStep("email")}>
          다른 이메일
        </button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={requestOtp}>
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          className="mt-1"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일 주소"
          required
          autoFocus
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {submitLabel}
      </Button>
      <div className="space-y-2">
        <p className="text-xs text-slate-500">회원 로그인 예시</p>
        {demoAccounts
          .filter((account) => !isAdminEmail(account.email))
          .map((account) => (
            <button
              key={account.email}
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
              onClick={() => setEmail(account.email)}
            >
              <span>
                <span className="font-semibold text-[#000092]">{account.type}</span>
                <span className="ml-2 text-slate-500">{account.email}</span>
              </span>
            </button>
          ))}
      </div>
    </form>
  );
}
