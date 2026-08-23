import { chmod, readFile, unlink, writeFile } from "node:fs/promises";
import https from "node:https";
import http from "node:http";
import { createConnection } from "node:net";
import { parseNasHost, type NasFileEntry, type NasSessionPublic } from "@/lib/nas";

export const NAS_SESSION_PATH = "/tmp/ne1-nas-session.json";
export type { NasFileEntry, NasSessionPublic };

export type NasLoginInput = {
  host: string;
  port?: number;
  username: string;
  password: string;
};

type NasSessionFile = NasSessionPublic & {
  password: string;
};

const insecureHttps = new https.Agent({ rejectUnauthorized: false });

function emptyPublic(): NasSessionPublic {
  return {
    connected: false,
    host: "",
    port: 5001,
    protocol: "https",
    username: "",
    lastMessage: "아직 계정을 넣지 않았습니다.",
  };
}

async function readSessionFile(): Promise<NasSessionFile | null> {
  try {
    return JSON.parse(await readFile(NAS_SESSION_PATH, "utf8")) as NasSessionFile;
  } catch {
    return null;
  }
}

export async function readNasSession(): Promise<NasSessionPublic> {
  const stored = await readSessionFile();
  if (!stored) return emptyPublic();
  const { password: _omit, ...publicState } = stored;
  return publicState;
}

export async function clearNasSession() {
  await unlink(NAS_SESSION_PATH).catch(() => undefined);
}

async function writeSession(session: NasSessionFile) {
  await writeFile(NAS_SESSION_PATH, JSON.stringify(session), { mode: 0o600 });
  await chmod(NAS_SESSION_PATH, 0o600).catch(() => undefined);
}

function probeTcp(host: string, port: number, timeoutMs = 4000) {
  return new Promise<{ open: boolean; detail: string }>((resolve) => {
    const socket = createConnection({ host, port });
    const finish = (open: boolean, detail: string) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve({ open, detail });
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true, "포트 열림"));
    socket.once("timeout", () => finish(false, "시간 초과"));
    socket.once("error", (error) => finish(false, error.message));
  });
}

async function dsmRequest(protocol: "https" | "http", host: string, port: number, pathAndQuery: string) {
  const url = `${protocol}://${host}:${port}${pathAndQuery}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
      // DSM 기본 인증서는 자체 서명인 경우가 많아 이 연결만 허용합니다.
      ...(protocol === "https" ? { dispatcher: undefined } : {}),
    });
    const text = await response.text();
    try {
      return { ok: response.ok, json: text ? JSON.parse(text) : null, status: response.status };
    } catch {
      return { ok: response.ok, json: null, status: response.status };
    }
  } finally {
    clearTimeout(timer);
  }
}

function nodeRequest(protocol: "https" | "http", host: string, port: number, pathAndQuery: string) {
  return new Promise<{ ok: boolean; json: unknown; status: number }>((resolve, reject) => {
    const lib = protocol === "https" ? https : http;
    const req = lib.request(
      {
        host,
        port,
        path: pathAndQuery,
        method: "GET",
        timeout: 8000,
        agent: protocol === "https" ? insecureHttps : undefined,
        headers: { Accept: "application/json" },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          try {
            resolve({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, json: text ? JSON.parse(text) : null, status: res.statusCode ?? 0 });
          } catch {
            resolve({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, json: null, status: res.statusCode ?? 0 });
          }
        });
      },
    );
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("시간 초과"));
    });
    req.on("error", reject);
    req.end();
  });
}

async function loginDsm(protocol: "https" | "http", host: string, port: number, username: string, password: string) {
  const query = `/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=login&account=${encodeURIComponent(username)}&passwd=${encodeURIComponent(password)}&session=FileStation&format=sid`;
  try {
    return await nodeRequest(protocol, host, port, query);
  } catch {
    return dsmRequest(protocol, host, port, query);
  }
}

function webdavRequest(
  protocol: "https" | "http",
  host: string,
  port: number,
  path: string,
  username: string,
  password: string,
  method = "PROPFIND",
) {
  return new Promise<{ status: number; text: string }>((resolve, reject) => {
    const lib = protocol === "https" ? https : http;
    const auth = Buffer.from(`${username}:${password}`).toString("base64");
    const req = lib.request(
      {
        host,
        port,
        path,
        method,
        timeout: 10000,
        agent: protocol === "https" ? insecureHttps : undefined,
        headers: {
          Authorization: `Basic ${auth}`,
          Depth: "1",
          ContentType: "application/xml",
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("시간 초과"));
    });
    req.on("error", reject);
    req.end();
  });
}

function parseWebdavNames(xml: string): NasFileEntry[] {
  const hrefs = [...xml.matchAll(/<[^>]*href[^>]*>([^<]+)<\/[^>]*href>/gi)].map((item) => decodeURIComponent(item[1]));
  const seen = new Set<string>();
  const entries: NasFileEntry[] = [];
  for (const href of hrefs) {
    const clean = href.replace(/\/+$/, "") || href;
    const name = clean.split("/").filter(Boolean).pop() || "/";
    if (seen.has(clean)) continue;
    seen.add(clean);
    entries.push({ name, href: clean, collection: href.endsWith("/") });
  }
  return entries.slice(0, 80);
}

export async function listNasFiles(path = "/webdav/"): Promise<{ ok: boolean; message: string; files: NasFileEntry[] }> {
  const stored = await readSessionFile();
  if (!stored?.connected || !stored.password) {
    return { ok: false, message: "먼저 접속 창에서 비밀번호를 넣고 로그인하세요.", files: [] };
  }
  const target = path.startsWith("/") ? path : `/${path}`;
  try {
    const result = await webdavRequest(stored.protocol, stored.host, stored.port, target, stored.username, stored.password);
    if (result.status === 401) return { ok: false, message: "WebDAV 권한이 거부되었습니다.", files: [] };
    if (result.status >= 400) return { ok: false, message: `목록을 읽지 못했습니다. (${result.status})`, files: [] };
    return { ok: true, message: `${stored.host}:${stored.port}${target}`, files: parseWebdavNames(result.text) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "목록을 읽지 못했습니다.", files: [] };
  }
}

function loginErrorMessage(code?: number) {
  if (code === 400) return "아이디 또는 비밀번호가 맞지 않습니다.";
  if (code === 401) return "계정이 꺼져 있습니다.";
  if (code === 402) return "권한이 거부되었습니다.";
  if (code === 403) return "2단계 인증이 켜져 있습니다. DSM에서 이 계정 OTP를 끄거나 앱 비밀번호를 쓰세요.";
  if (code === 404) return "일회용 비밀번호가 필요합니다.";
  if (code === 406) return "강제 비밀번호 변경 상태입니다.";
  if (code === 407) return "IP가 차단되어 있습니다.";
  return "DSM 로그인에 실패했습니다.";
}

export async function loginNas(input: NasLoginInput): Promise<NasSessionPublic> {
  const parsed = parseNasHost(input.port ? `${input.host}:${input.port}` : input.host);
  if (!parsed) {
    return { ...emptyPublic(), lastMessage: "접속 주소 형식이 아닙니다. 공인 IP, QuickConnect ID, 또는 호스트:포트로 넣어 주세요." };
  }
  const username = input.username.trim();
  if (!username || !input.password) {
    return { ...emptyPublic(), host: parsed.host, port: parsed.port, protocol: parsed.protocol, lastMessage: "아이디와 비밀번호를 같이 넣어 주세요." };
  }

  const reach = await probeTcp(parsed.host, parsed.port);
  if (!reach.open) {
    const session: NasSessionFile = {
      connected: false,
      host: parsed.host,
      port: parsed.port,
      protocol: parsed.protocol,
      username,
      password: input.password,
      lastMessage: `이 작업 서버에서 ${parsed.host}:${parsed.port} 에 닿지 않습니다. (${reach.detail}) 공유기에서 DSM/QuickConnect가 밖으로 열려 있는지 확인해 주세요. SSH(22)를 상시로 인터넷에 열지는 마세요.`,
    };
    await writeSession(session);
    const { password: _omit, ...publicState } = session;
    return publicState;
  }

  for (const path of ["/webdav/", "/"]) {
    try {
      const dav = await webdavRequest(parsed.protocol, parsed.host, parsed.port, path, username, input.password);
      if (dav.status === 207 || dav.status === 200) {
        const session: NasSessionFile = {
          connected: true,
          host: parsed.host,
          port: parsed.port,
          protocol: parsed.protocol,
          username,
          password: input.password,
          via: "webdav",
          connectedAt: new Date().toISOString(),
          lastMessage: `WebDAV 로그인됨 · ${parsed.host}:${parsed.port} · ${username}`,
        };
        await writeSession(session);
        const { password: _omit, ...publicState } = session;
        return publicState;
      }
      if (dav.status === 401) {
        const session: NasSessionFile = {
          connected: false,
          host: parsed.host,
          port: parsed.port,
          protocol: parsed.protocol,
          username,
          password: input.password,
          lastMessage: "아이디 또는 비밀번호가 맞지 않습니다.",
        };
        await writeSession(session);
        const { password: _omit, ...publicState } = session;
        return publicState;
      }
    } catch {
      // DSM 로그인을 이어서 시도합니다.
    }
  }

  const attempts: Array<{ protocol: "https" | "http"; port: number }> = [
    { protocol: parsed.protocol, port: parsed.port },
  ];
  if (parsed.port === 5001) attempts.push({ protocol: "http", port: 5000 });
  if (parsed.port === 443) attempts.push({ protocol: "http", port: 80 });

  let lastMessage = "DSM에 로그인하지 못했습니다.";
  for (const attempt of attempts) {
    try {
      const result = await loginDsm(attempt.protocol, parsed.host, attempt.port, username, input.password);
      const body = result.json as { success?: boolean; data?: { sid?: string }; error?: { code?: number } } | null;
      if (body?.success && body.data?.sid) {
        const session: NasSessionFile = {
          connected: true,
          host: parsed.host,
          port: attempt.port,
          protocol: attempt.protocol,
          username,
          password: input.password,
          sid: body.data.sid,
          connectedAt: new Date().toISOString(),
          lastMessage: `DSM 로그인됨 · ${parsed.host}:${attempt.port} · ${username}`,
        };
        await writeSession(session);
        const { password: _omit, ...publicState } = session;
        return publicState;
      }
      lastMessage = loginErrorMessage(body?.error?.code);
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : "연결에 실패했습니다.";
    }
  }

  const failed: NasSessionFile = {
    connected: false,
    host: parsed.host,
    port: parsed.port,
    protocol: parsed.protocol,
    username,
    password: input.password,
    lastMessage,
  };
  await writeSession(failed);
  const { password: _omit, ...publicState } = failed;
  return publicState;
}
