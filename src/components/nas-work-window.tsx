"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NAS_DEFAULT_ADDRESS,
  NAS_DEFAULT_USERNAME,
  type NasFileEntry,
  type NasSessionPublic,
} from "@/lib/nas";

export function NasWorkWindow() {
  const [host, setHost] = useState(NAS_DEFAULT_ADDRESS);
  const [username, setUsername] = useState(NAS_DEFAULT_USERNAME);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<NasSessionPublic | null>(null);
  const [files, setFiles] = useState<NasFileEntry[]>([]);
  const [fileMessage, setFileMessage] = useState("");

  useEffect(() => {
    void hydrate();
  }, []);

  async function hydrate() {
    try {
      const next = (await (await fetch("/api/connect/nas/login")).json()) as NasSessionPublic;
      applySession(next);
      if (next.connected) await loadFiles();
    } catch {
      setError("NAS 상태를 읽지 못했습니다.");
    }
  }

  function applySession(next: NasSessionPublic) {
    setSession(next);
    if (next.host) {
      setHost(next.port && next.port !== 443 && next.port !== 80 ? `${next.host}:${next.port}` : next.host);
    }
    if (next.username) setUsername(next.username);
    if (next.connected) setError("");
  }

  async function loadFiles() {
    try {
      const listed = (await (await fetch("/api/connect/nas/files")).json()) as {
        files?: NasFileEntry[];
        message?: string;
      };
      setFiles(listed.files ?? []);
      setFileMessage(listed.message ?? "");
    } catch {
      setFileMessage("파일 목록을 읽지 못했습니다.");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/connect/nas/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, username, password }),
      });
      const next = (await response.json()) as NasSessionPublic;
      applySession(next);
      if (!next.connected) {
        setError(next.lastMessage || "접속에 실패했습니다.");
        return;
      }
      setPassword("");
      await loadFiles();
    } catch {
      setError("NAS 접속 요청을 보내지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    await fetch("/api/connect/nas/login", { method: "DELETE" });
    setSession(null);
    setFiles([]);
    setFileMessage("");
    setPassword("");
    setBusy(false);
  }

  const connected = Boolean(session?.connected);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3 md:px-6">
        <p className="text-sm font-semibold text-[#000092]">관리자 · NAS 개발 창</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          시놀로지 계정으로 이 창에서 접속합니다. 쇼핑몰 메뉴에는 없습니다. 비밀번호는 이 작업 세션에만 두고 git에는
          저장하지 않습니다.
        </p>
      </div>

      <form className="space-y-4 px-4 py-5 md:px-6" onSubmit={submit} autoComplete="on">
        <p className="text-sm leading-6 text-slate-600">
          주소·아이디·비밀번호를 넣고 접속하세요. WebDAV가 열려 있으면 이 작업 서버에서 폴더를 읽고 소스를 올릴 수
          있습니다. DSM(5000·5001)·SSH(22)는 인터넷에 상시로 열지 마세요.
        </p>

        <div>
          <Label htmlFor="nas-host">접속 주소</Label>
          <Input
            id="nas-host"
            name="host"
            autoComplete="url"
            className="mt-1 font-mono"
            placeholder="matzi57.synology.me:5006"
            value={host}
            onChange={(event) => setHost(event.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="nas-user">아이디</Label>
          <Input
            id="nas-user"
            name="username"
            autoComplete="username"
            className="mt-1"
            placeholder="matzi2"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="nas-password">비밀번호</Label>
          <Input
            id="nas-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-1"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required={!connected}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {connected ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-semibold">접속됨 · {session?.username}</p>
            <p className="mt-1">{session?.lastMessage}</p>
            {fileMessage ? <p className="mt-1 font-mono text-xs">{fileMessage}</p> : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="navy" size="lg" disabled={busy || !host.trim() || !username.trim() || !password.trim()}>
            {busy ? "접속 중…" : "이 창에서 접속"}
          </Button>
          {connected ? (
            <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => void disconnect()}>
              접속 끊기
            </Button>
          ) : null}
        </div>
      </form>

      {connected && files.length ? (
        <div className="border-t border-slate-200 px-4 py-5 md:px-6">
          <p className="text-sm font-semibold text-[#000092]">공유 폴더</p>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {files.map((item) => (
              <li key={item.href} className="truncate rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                {item.collection ? "폴더" : "파일"} · {item.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
