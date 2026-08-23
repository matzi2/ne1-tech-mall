import { chmod, readFile, unlink, writeFile } from "node:fs/promises";
import https from "node:https";
import http from "node:http";
import { createConnection } from "node:net";
import { parseNasHost, NAS_DSM_HTTPS_PORT, NAS_QUICKCONNECT_ID, type NasFileEntry, type NasSessionPublic } from "@/lib/nas";
import { HOSTING_WAN_IPV4 } from "@/lib/hosting";

export const NAS_SESSION_PATH = "/tmp/ne1-nas-session.json";
export type { NasFileEntry, NasSessionPublic };

export type NasLoginInput = {
  host: string;
  port?: number;
  username: string;
  password: string;
  otp?: string;
};

type NasSessionFile = NasSessionPublic & {
  password: string;
  synoToken?: string;
  davHost?: string;
  davPort?: number;
};

const insecureHttps = new https.Agent({ rejectUnauthorized: false });

function emptyPublic(): NasSessionPublic {
  return {
    connected: false,
    host: "",
    port: NAS_DSM_HTTPS_PORT,
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

function toPublic(session: NasSessionFile): NasSessionPublic {
  return {
    connected: session.connected,
    host: session.host,
    port: session.port,
    protocol: session.protocol,
    username: session.username,
    sid: session.sid,
    via: session.via,
    needOtp: session.needOtp,
    connectedAt: session.connectedAt,
    lastMessage: session.lastMessage,
  };
}

export async function readNasSession(): Promise<NasSessionPublic> {
  const stored = await readSessionFile();
  if (!stored) return emptyPublic();
  return toPublic(stored);
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

function nodeRequest(
  protocol: "https" | "http",
  host: string,
  port: number,
  pathAndQuery: string,
  options?: { method?: string; body?: string; headers?: Record<string, string> },
) {
  return new Promise<{ ok: boolean; json: unknown; status: number }>((resolve, reject) => {
    const lib = protocol === "https" ? https : http;
    const method = options?.method ?? "GET";
    const body = options?.body;
    const req = lib.request(
      {
        host,
        port,
        path: pathAndQuery,
        method,
        timeout: 12000,
        agent: protocol === "https" ? insecureHttps : undefined,
        headers: {
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": String(Buffer.byteLength(body)) } : {}),
          ...options?.headers,
        },
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
    if (body) req.write(body);
    req.end();
  });
}

type DsmAuthData = {
  sid?: string;
  synotoken?: string;
  is_portal_port?: boolean;
};

type DsmBody = {
  success?: boolean;
  data?: DsmAuthData & { shares?: Array<{ name?: string; path?: string }>; files?: Array<{ name?: string; isdir?: boolean; path?: string }> };
  error?: { code?: number };
};

async function loginDsm(
  protocol: "https" | "http",
  host: string,
  port: number,
  username: string,
  password: string,
  otp?: string,
) {
  const form = new URLSearchParams({
    api: "SYNO.API.Auth",
    version: "7",
    method: "login",
    account: username,
    passwd: password,
    session: "FileStation",
    format: "sid",
    enable_syno_token: "yes",
  });
  if (otp) form.set("otp_code", otp.trim());
  try {
    return await nodeRequest(protocol, host, port, "/webapi/entry.cgi", { method: "POST", body: form.toString() });
  } catch {
    const fallback = new URLSearchParams(form);
    fallback.set("version", otp ? "6" : "3");
    const query = `/webapi/auth.cgi?${fallback.toString()}`;
    try {
      return await nodeRequest(protocol, host, port, query);
    } catch {
      return dsmRequest(protocol, host, port, query);
    }
  }
}

async function fileStationShares(session: NasSessionFile) {
  if (!session.sid) return { ok: false, json: null as DsmBody | null, status: 0 };
  const query = `/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list_share&_sid=${encodeURIComponent(session.sid)}`;
  const headers = session.synoToken ? { "X-SYNO-TOKEN": session.synoToken } : undefined;
  try {
    return await nodeRequest(session.protocol, session.host, session.port, query, { headers });
  } catch {
    return { ok: false, json: null, status: 0 };
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
  if (!stored?.connected) {
    return { ok: false, message: "먼저 접속 창에서 비밀번호를 넣고 로그인하세요.", files: [] };
  }
  if (stored.sid) {
    const listed = await fileStationShares(stored);
    const body = listed.json as DsmBody | null;
    const shares = body?.data?.shares ?? [];
    if (body?.success && shares.length) {
      return {
        ok: true,
        message: `DSM File Station · ${stored.host}:${stored.port}`,
        files: shares.slice(0, 80).map((share) => ({
          name: share.name || share.path || "/",
          href: share.path || `/${share.name || ""}`,
          collection: true,
        })),
      };
    }
  }
  if (!stored.password) {
    return { ok: false, message: "파일 목록을 읽으려면 이 창에서 다시 접속하세요.", files: [] };
  }
  const davHost = stored.davHost || (stored.host.endsWith(".synology.me") ? stored.host : `${NAS_QUICKCONNECT_ID}.synology.me`);
  const davPort = stored.davPort || 5006;
  const target = path.startsWith("/") ? path : `/${path}`;
  try {
    const result = await webdavRequest("https", davHost, davPort, target, stored.username, stored.password);
    if (result.status === 401) return { ok: false, message: "WebDAV 권한이 거부되었습니다.", files: [] };
    if (result.status >= 400) return { ok: false, message: `목록을 읽지 못했습니다. (${result.status})`, files: [] };
    return { ok: true, message: `${davHost}:${davPort}${target}`, files: parseWebdavNames(result.text) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "목록을 읽지 못했습니다.", files: [] };
  }
}

function loginErrorMessage(code?: number) {
  if (code === 400) return "아이디 또는 비밀번호가 맞지 않습니다.";
  if (code === 401) return "계정이 꺼져 있습니다.";
  if (code === 402) return "권한이 거부되었습니다.";
  if (code === 403) return "2단계 인증이 켜져 있습니다. 이 창 OTP 칸에 앱 숫자만 넣고 다시 접속하세요. 채팅에는 넣지 마세요.";
  if (code === 404) return "일회용 비밀번호가 필요합니다.";
  if (code === 406) return "강제 비밀번호 변경 상태입니다.";
  if (code === 407) return "IP가 차단되어 있습니다.";
  return "DSM 로그인에 실패했습니다.";
}

export async function loginNas(input: NasLoginInput): Promise<NasSessionPublic> {
  const parsed = parseNasHost(input.port ? `${input.host}:${input.port}` : input.host);
  if (!parsed) {
    return { ...emptyPublic(), lastMessage: "접속 주소 형식이 아닙니다. QuickConnect.to/아이디, 공인 IP, 또는 호스트:포트로 넣어 주세요." };
  }
  const stored = await readSessionFile();
  const username = input.username.trim();
  const password = input.password || stored?.password || "";
  const otp = input.otp?.trim();
  if (!username || !password) {
    return { ...emptyPublic(), host: parsed.host, port: parsed.port, protocol: parsed.protocol, lastMessage: "아이디와 비밀번호를 같이 넣어 주세요." };
  }

  const dsmTargets: Array<{ host: string; port: number; protocol: "https" | "http" }> = [
    { host: parsed.host, port: parsed.port, protocol: parsed.protocol },
  ];
  if (parsed.quickConnectId) {
    dsmTargets.unshift(
      { host: `${parsed.quickConnectId}.synology.me`, port: NAS_DSM_HTTPS_PORT, protocol: "https" },
      { host: HOSTING_WAN_IPV4, port: NAS_DSM_HTTPS_PORT, protocol: "https" },
    );
  } else if (parsed.port === 5006 || parsed.port === 5001 || parsed.port === 443) {
    dsmTargets.push({ host: parsed.host, port: NAS_DSM_HTTPS_PORT, protocol: "https" });
  }

  let lastMessage = "DSM에 로그인하지 못했습니다.";
  for (const attempt of dsmTargets) {
    const reach = await probeTcp(attempt.host, attempt.port);
    if (!reach.open) continue;
    try {
      const result = await loginDsm(attempt.protocol, attempt.host, attempt.port, username, password, otp);
      const body = result.json as DsmBody | null;
      if (body?.success && body.data?.sid) {
        const session: NasSessionFile = {
          connected: true,
          host: attempt.host,
          port: attempt.port,
          protocol: attempt.protocol,
          username,
          password,
          sid: body.data.sid,
          synoToken: body.data.synotoken,
          via: "dsm",
          davHost: parsed.quickConnectId ? `${parsed.quickConnectId}.synology.me` : attempt.host,
          davPort: 5006,
          connectedAt: new Date().toISOString(),
          lastMessage: `DSM 로그인됨 · QuickConnect ${parsed.quickConnectId ?? attempt.host} · ${username}`,
        };
        await writeSession(session);
        return toPublic(session);
      }
      lastMessage = loginErrorMessage(body?.error?.code);
      if (body?.error?.code === 403 || body?.error?.code === 404) {
        if (!otp) break;
      }
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : "연결에 실패했습니다.";
    }
  }

  const reach = await probeTcp(parsed.host, parsed.port === NAS_DSM_HTTPS_PORT ? 5006 : parsed.port);
  const davHost = parsed.quickConnectId ? `${parsed.quickConnectId}.synology.me` : parsed.host;
  const davPort = parsed.quickConnectId || parsed.port === NAS_DSM_HTTPS_PORT ? 5006 : parsed.port;
  const davProto: "https" | "http" = "https";
  if (reach.open || parsed.quickConnectId) {
    for (const path of ["/webdav/", "/", "/docker/"]) {
      try {
        const dav = await webdavRequest(davProto, davHost, davPort, path, username, password);
        if (dav.status === 207 || dav.status === 200) {
          const session: NasSessionFile = {
            connected: true,
            host: davHost,
            port: davPort,
            protocol: davProto,
            username,
            password,
            via: "webdav",
            davHost,
            davPort,
            needOtp: !otp,
            connectedAt: new Date().toISOString(),
            lastMessage: otp
              ? `${lastMessage} WebDAV는 연결됐습니다 · ${davHost}:${davPort}`
              : `WebDAV 로그인됨 · ${davHost}:${davPort} · ${username}. DSM은 OTP가 필요합니다.`,
          };
          await writeSession(session);
          return toPublic(session);
        }
      } catch {
        // DSM 메시지를 유지합니다.
      }
    }
  }

  const failed: NasSessionFile = {
    connected: false,
    host: parsed.host,
    port: parsed.port,
    protocol: parsed.protocol,
    username,
    password,
    needOtp: lastMessage.includes("2단계") || lastMessage.includes("일회용"),
    lastMessage,
  };
  await writeSession(failed);
  return toPublic(failed);
}
