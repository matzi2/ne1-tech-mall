"use client";

import { useEffect, useState } from "react";
import type { GitHubConnectState } from "@/lib/github-types";

export function GitHubWorkWindow({ initial }: { initial: GitHubConnectState }) {
  const [state, setState] = useState(initial);
  const [tab, setTab] = useState<"connect" | "token">("connect");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("done") === "1") setNotice("GitHub 저장소가 연결되었습니다.");
    const error = query.get("error");
    if (error) setNotice(error === "token" ? "토큰을 입력해 주세요." : error);
  }, []);

  useEffect(() => {
    if (state.status !== "pending") return;
    const wait = Math.max(3, state.interval || 5) * 1000;
    const timer = window.setInterval(() => {
      void fetch("/api/connect/github/poll", { method: "POST" })
        .then((response) => response.json())
        .then((next: GitHubConnectState) => setState(next));
    }, wait);
    return () => window.clearInterval(timer);
  }, [state.interval, state.status]);

  const connected = state.status === "published" || state.status === "authorized";
  const code = state.userCode ?? "---- ----";

  async function copyCode() {
    if (!state.userCode) return;
    await navigator.clipboard.writeText(state.userCode.replace(/\s/g, ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        {notice ? (
          <p
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              connected || notice.includes("연결되었습니다")
                ? "bg-emerald-50 text-emerald-800"
                : "bg-amber-50 text-amber-900"
            }`}
          >
            {notice}
          </p>
        ) : null}

        {connected ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-semibold">GitHub 연결됨 · {state.login}</p>
            {state.repoHtmlUrl ? (
              <p className="mt-2 break-all text-sm">{state.repoHtmlUrl}</p>
            ) : (
              <p className="mt-1 text-sm">{state.message}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                  tab === "connect" ? "bg-white text-[#000092] shadow-sm" : "text-slate-500"
                }`}
                onClick={() => setTab("connect")}
              >
                장치 코드
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                  tab === "token" ? "bg-white text-[#000092] shadow-sm" : "text-slate-500"
                }`}
                onClick={() => setTab("token")}
              >
                토큰으로 연결
              </button>
            </div>

            {tab === "connect" ? (
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-[#0046CA]">GITHUB.COM/LOGIN/DEVICE</p>
                  <h1 className="mt-1 text-xl font-bold text-[#000092]">GitHub 저장소 연결</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    지금 보이는 Chrome 작업창의 코드를, 보스가 볼 수 있는 Chrome에서
                    github.com/login/device 에 입력하고 Authorize를 눌러 주세요. 승인이 끝나면 이 창이
                    저장소 생성·푸시까지 진행합니다.
                  </p>
                </div>
                <div className="rounded-xl bg-[#0d1117] px-4 py-8 text-center text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">one-time code</p>
                  <p className="mt-3 select-all font-mono text-3xl font-bold tracking-[0.18em] md:text-4xl">
                    {code}
                  </p>
                  <p className="mt-3 text-sm text-white/60">{state.message ?? "연결 대기 중"}</p>
                  {state.expiresAt ? (
                    <p className="mt-2 text-xs text-white/40">
                      {new Date(state.expiresAt).toLocaleTimeString("ko-KR")} 까지 유효
                    </p>
                  ) : null}
                </div>
                <p className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                  {state.verificationUriComplete || state.verificationUri}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className="h-12 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700"
                    onClick={() => void copyCode()}
                    disabled={!state.userCode}
                  >
                    {copied ? "코드를 복사했습니다" : "코드 복사"}
                  </button>
                  <button
                    type="button"
                    className="h-12 rounded-lg bg-[#0046CA] text-sm font-semibold text-white"
                    onClick={() => setTab("token")}
                  >
                    이 창에서 토큰으로 연결
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-[#000092]">토큰으로 연결</h1>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    GitHub Settings → Developer settings → Personal access tokens에서 repo 권한 토큰을
                    만든 뒤, 이 보이는 창에 붙여 넣으면 바로 연결됩니다.
                  </p>
                </div>
                <form className="space-y-3" action="/api/connect/github/token" method="post">
                  <input type="hidden" name="repoName" value={state.repoName || "ne1-tech-mall"} />
                  <textarea
                    name="token"
                    required
                    className="min-h-32 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
                    placeholder="ghp_... 또는 github_pat_..."
                  />
                  <button type="submit" className="h-12 w-full rounded-lg bg-[#000092] text-sm font-semibold text-white">
                    이 Chrome 작업창에서 연결
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
