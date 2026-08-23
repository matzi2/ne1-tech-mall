"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GitHubConnectState } from "@/lib/github-types";

export function GitHubDesk() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [repoName, setRepoName] = useState("ne1-tech-mall");
  const [isPrivate, setIsPrivate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GitHubConnectState | null>(null);

  const connected = result?.status === "published" || result?.status === "authorized";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/connect/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          token,
          repoName,
          isPrivate,
        }),
      });
      const next = (await response.json()) as GitHubConnectState;
      setResult(next);
      if (!response.ok || next.status === "error") {
        setError(next.message ?? "연결에 실패했습니다.");
        return;
      }
      setToken("");
    } catch {
      setError("GitHub 연결에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3 md:px-6">
        <p className="text-sm font-semibold text-[#000092]">관리자 · GitHub 계정 로그인 창</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          이 창은 계정 로그인만 합니다. 토큰·장치 코드는 토큰 창에서 다룹니다. 쇼핑몰 메뉴에는 없습니다.
        </p>
      </div>

      <form className="space-y-4 px-4 py-5 md:px-6" onSubmit={submit} autoComplete="on">
        <p className="text-sm leading-6 text-slate-600">
          GitHub 아이디와 Personal Access Token을 넣고 이 창에서 로그인합니다. 계정 비밀번호는 git이 받지
          않습니다. 토큰은 이 작업 세션에만 두고 git에는 저장하지 않습니다.
        </p>

        <div>
          <Label htmlFor="gh-username">GitHub 아이디</Label>
          <Input
            id="gh-username"
            name="username"
            autoComplete="username"
            className="mt-1"
            placeholder="예: matzi2"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="gh-token">Personal Access Token</Label>
          <Input
            id="gh-token"
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 font-mono"
            placeholder="ghp_… 또는 github_pat_…"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="gh-repo">저장소 이름</Label>
            <Input
              id="gh-repo"
              className="mt-1 font-mono"
              value={repoName}
              onChange={(event) => setRepoName(event.target.value)}
              disabled={connected}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
              disabled={connected}
            />
            비공개 저장소
          </label>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {connected ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-semibold">연결됨 · {result?.login}</p>
            {result?.repoHtmlUrl ? (
              <a
                className="mt-1 inline-block break-all text-[#0046CA] underline"
                href={result.repoHtmlUrl}
                target="_blank"
                rel="noreferrer"
              >
                {result.repoHtmlUrl}
              </a>
            ) : (
              <p className="mt-1">{result?.message}</p>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="navy" size="lg" disabled={busy || !username.trim() || !token.trim()}>
            {busy ? "연결 중…" : "이 창에서 로그인"}
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/admin/github/token">토큰 창 열기</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
