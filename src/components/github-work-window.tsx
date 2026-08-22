"use client";

import { useEffect, useState } from "react";
import type { GitHubConnectState } from "@/lib/github-types";

export function GitHubWorkWindow({ initial }: { initial: GitHubConnectState }) {
  const [state, setState] = useState(initial);

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
  const githubUrl = state.verificationUri || "https://github.com/login/device";

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-6 text-white">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#161b22] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <p className="ml-2 text-sm font-medium text-white/80">GitHub 연결 작업창 · NE1-TECH</p>
        </div>

        <div className="space-y-6 p-6 md:p-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#58a6ff]">GITHUB CONNECT</p>
            <h1 className="mt-2 text-2xl font-bold">GitHub 저장소 연결</h1>
            <p className="mt-2 text-sm leading-6 text-white/70">
              이 창에서 코드를 확인하고, GitHub 로그인 화면에서 입력하면 연결됩니다.
              팝업이 없어도 아래 버튼으로 GitHub 작업 화면이 열립니다.
            </p>
          </div>

          {connected ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
              <p className="font-semibold text-emerald-300">연결됨 · {state.login}</p>
              {state.repoHtmlUrl ? (
                <a className="mt-2 inline-block text-[#58a6ff] underline" href={state.repoHtmlUrl} target="_blank" rel="noreferrer">
                  {state.repoHtmlUrl}
                </a>
              ) : (
                <p className="mt-1 text-sm text-white/70">{state.message}</p>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-black px-4 py-8 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">one-time code</p>
                <p className="mt-3 select-all font-mono text-4xl font-bold tracking-[0.22em] md:text-5xl">{code}</p>
                <p className="mt-3 text-sm text-white/60">{state.message ?? "GitHub에 이 코드를 입력하세요."}</p>
              </div>

              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-14 items-center justify-center rounded-lg bg-[#238636] text-base font-semibold text-white hover:bg-[#2ea043]"
              >
                GitHub 로그인 작업창 열기
              </a>

              <ol className="list-decimal space-y-1 pl-5 text-sm text-white/70">
                <li>위 코드를 복사합니다.</li>
                <li>GitHub 로그인 작업창에 코드를 넣고 Authorize를 누릅니다.</li>
                <li>이 창이 연결됨으로 바뀌면 저장소 푸시가 진행됩니다.</li>
              </ol>
            </>
          )}

          <div className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold">이 작업창에서 토큰으로 연결</h2>
            <p className="mt-1 text-sm text-white/60">
              GitHub 화면이 안 열리면 토큰을 이 창에 붙여 넣으세요. repo 권한이 필요합니다.
            </p>
            <form className="mt-4 space-y-3" action="/api/connect/github/token" method="post">
              <input type="hidden" name="repoName" value={state.repoName || "ne1-tech-mall"} />
              <textarea
                name="token"
                required
                className="min-h-28 w-full rounded-md border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white"
                placeholder="ghp_... 또는 github_pat_..."
              />
              <button type="submit" className="h-11 rounded-md bg-white px-5 text-sm font-semibold text-black">
                토큰으로 저장소 연결
              </button>
            </form>
            <a
              className="mt-3 inline-block text-sm text-[#58a6ff] underline"
              href="https://github.com/settings/tokens/new?scopes=repo,read:org,workflow&description=NE1-TECH%20mall"
              target="_blank"
              rel="noreferrer"
            >
              GitHub 토큰 발급 작업창 열기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
