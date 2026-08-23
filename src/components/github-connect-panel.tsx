"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GitHubConnectState } from "@/lib/github-types";

const idle: GitHubConnectState = {
  status: "idle",
  userCode: null,
  verificationUri: "https://github.com/login/device",
  verificationUriComplete: null,
  interval: 5,
  expiresAt: null,
  login: null,
  name: null,
  htmlUrl: null,
  repoName: "ne1-tech-mall",
  isPrivate: false,
  repoUrl: null,
  repoHtmlUrl: null,
  message: null,
  startedAt: null,
};

export function GitHubConnectPanel({ autoStart = true }: { autoStart?: boolean }) {
  const [state, setState] = useState<GitHubConnectState>(idle);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [repoName, setRepoName] = useState("ne1-tech-mall");
  const [isPrivate, setIsPrivate] = useState(false);
  const startedRef = useRef(false);

  const apply = useCallback((next: GitHubConnectState) => {
    setState(next);
    if (next.repoName) setRepoName(next.repoName);
    setIsPrivate(Boolean(next.isPrivate));
    setError(next.status === "error" ? next.message ?? "연결에 실패했습니다." : "");
  }, []);

  const start = useCallback(
    async (force = false) => {
      setBusy(true);
      setError("");
      try {
        const response = await fetch("/api/connect/github/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force, repoName, isPrivate }),
        });
        const next = (await response.json()) as GitHubConnectState;
        apply(next);
      } catch {
        setError("GitHub 연결을 시작하지 못했습니다.");
      } finally {
        setBusy(false);
      }
    },
    [apply, isPrivate, repoName],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/connect/github/status")
      .then((response) => response.json())
      .then((next: GitHubConnectState) => {
        if (!cancelled) apply(next);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  useEffect(() => {
    if (!autoStart || !loaded || startedRef.current) return;
    if (state.status === "published" || state.status === "authorized") return;
    startedRef.current = true;
    void start(false);
  }, [autoStart, loaded, start, state.status]);

  useEffect(() => {
    if (state.status !== "pending") return;
    const wait = Math.max(3, state.interval) * 1000;
    const timer = window.setInterval(() => {
      void fetch("/api/connect/github/poll", { method: "POST" })
        .then((response) => response.json())
        .then((next: GitHubConnectState) => apply(next));
    }, wait);
    return () => window.clearInterval(timer);
  }, [apply, state.interval, state.status]);

  async function copyCode() {
    if (!state.userCode) return;
    await navigator.clipboard.writeText(state.userCode.replace(/\s/g, ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function submitToken(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/connect/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, repoName, isPrivate }),
      });
      const next = (await response.json()) as GitHubConnectState;
      apply(next);
      setToken("");
    } catch {
      setError("토큰 연결에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const connected = state.status === "published" || state.status === "authorized";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">다른 방법 · 장치 코드</p>
        <h2 className="mt-1 text-xl font-bold text-[#000092]">GitHub device flow</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          코드를 발급한 뒤 github.com/login/device 에서 승인하면{" "}
          <code>{repoName || "ne1-tech-mall"}</code> 저장소로 소스가 올라갑니다.
        </p>

        <div className="mt-5 rounded-xl bg-[#0d1117] px-4 py-7 text-center text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">GitHub one-time code</p>
          <p className="mt-3 font-mono text-4xl font-bold tracking-[0.2em] md:text-5xl">
            {state.userCode ?? (busy ? "발급 중…" : "---- ----")}
          </p>
          <p className="mt-3 text-sm text-white/70">
            {state.message ?? "이 Chrome 작업창에서 코드를 확인하고 연결하세요."}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="lg" onClick={() => void start(true)} disabled={busy}>
            코드 다시 발급
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => void copyCode()} disabled={!state.userCode}>
            {copied ? "코드를 복사했습니다" : "코드 복사"}
          </Button>
        </div>

        <ol className="mt-5 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>위 코드를 복사합니다.</li>
          <li>같은 Chrome 작업창의 토큰 입력란에 repo 권한 토큰을 붙여 넣습니다.</li>
          <li>연결됨으로 바뀌면 저장소 푸시까지 진행됩니다.</li>
        </ol>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {connected ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-semibold">연결됨 · {state.login}</p>
            {state.repoHtmlUrl ? (
              <a
                className="mt-1 inline-block text-[#0046CA] underline"
                href={state.repoHtmlUrl}
                target="_blank"
                rel="noreferrer"
              >
                {state.repoHtmlUrl}
              </a>
            ) : (
              <p className="mt-1">{state.message}</p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-xs text-slate-500">
            상태: {state.status}
            {state.expiresAt ? ` · 코드 만료 ${new Date(state.expiresAt).toLocaleTimeString("ko-KR")}` : ""}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#000092]">저장소 설정</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="repo">저장소 이름</Label>
            <Input
              id="repo"
              className="mt-1 font-mono"
              value={repoName}
              onChange={(event) => setRepoName(event.target.value)}
              disabled={connected}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
              disabled={connected}
            />
            비공개 저장소
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-500">원격 이름 github · 브랜치 main · origin(Cursor)은 유지합니다.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#000092]">다른 방법 · Personal Access Token</h2>
        <p className="mt-1 text-sm text-slate-600">
          장치 코드 창이 막히면 GitHub에서 <code>repo</code> 권한 토큰을 만들어 붙여 넣으세요.
        </p>
        <form className="mt-4 space-y-3" onSubmit={submitToken}>
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="ghp_... 또는 github_pat_..."
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <Button type="submit" variant="navy" disabled={busy || !token.trim()}>
            토큰으로 저장소 연결
          </Button>
        </form>
      </section>
    </div>
  );
}
