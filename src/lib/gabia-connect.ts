import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { company } from "@/lib/company";
import type { GabiaPublicState } from "@/lib/gabia-types";

export type { GabiaPublicState } from "@/lib/gabia-types";

const STATE_PATH = path.join("/tmp", "ne1-gabia-session.json");
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type StoredState = GabiaPublicState & {
  cookies: Record<string, string>;
  token: string | null;
  captchaVcid: string | null;
};

function empty(): StoredState {
  return {
    status: "idle",
    userId: null,
    captchaSrc: "/api/connect/gabia/captcha",
    message: null,
    applied: [],
    cookies: {},
    token: null,
    captchaVcid: null,
  };
}

function publicView(state: StoredState): GabiaPublicState {
  return {
    status: state.status,
    userId: state.userId,
    captchaSrc: state.captchaVcid
      ? `/api/connect/gabia/captcha?t=${encodeURIComponent(state.captchaVcid)}&n=${Date.now()}`
      : null,
    message: state.message,
    applied: state.applied,
  };
}

async function load(): Promise<StoredState> {
  try {
    const raw = await readFile(STATE_PATH, "utf8");
    return { ...empty(), ...(JSON.parse(raw) as StoredState) };
  } catch {
    return empty();
  }
}

async function save(state: StoredState) {
  await writeFile(STATE_PATH, JSON.stringify(state), "utf8");
}

function cookieHeader(cookies: Record<string, string>) {
  return Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

function mergeCookies(current: Record<string, string>, setCookie: string[]) {
  const next = { ...current };
  for (const line of setCookie) {
    const pair = line.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq > 0) next[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
  return next;
}

function setCookieList(headers: Headers) {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  if (typeof getSetCookie === "function") return getSetCookie.call(headers);
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

async function gabiaFetch(state: StoredState, url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("User-Agent", USER_AGENT);
  headers.set("Accept", "application/json, text/plain, */*");
  const cookie = cookieHeader(state.cookies);
  if (cookie) headers.set("Cookie", cookie);
  const response = await fetch(url, { ...init, headers, redirect: "follow" });
  state.cookies = mergeCookies(state.cookies, setCookieList(response.headers));
  return response;
}

export async function gabiaStatus() {
  return publicView(await load());
}

export async function gabiaInit() {
  const state = empty();
  const response = await gabiaFetch(state, "https://member-public-api.gabia.com/v1/auth/login/init", {
    headers: {
      Origin: "https://accounts.gabia.com",
      Referer: "https://accounts.gabia.com/",
    },
  });
  const data = (await response.json()) as {
    result?: boolean;
    message?: string;
    token?: string;
    captchaInfo?: { captchaVcid?: string };
  };
  state.token = data.token ?? null;
  state.captchaVcid = data.captchaInfo?.captchaVcid ?? null;
  state.status = "login";
  state.message = data.message ?? "가비아 보안 문자를 이 창에 넣으세요.";
  await save(state);
  return publicView(state);
}

export async function gabiaCaptchaImage() {
  const state = await load();
  const vcid = state.captchaVcid;
  if (!vcid) return null;
  const url = `https://captcha.gabia.com/captchahandler/index?get=image&c=gcaptchaapi&t=${encodeURIComponent(vcid)}`;
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Cookie: cookieHeader(state.cookies) } });
  if (!response.ok) return null;
  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    type: response.headers.get("content-type") || "image/jpeg",
  };
}

export async function gabiaLogin(input: { userId: string; password: string; captchaValue: string }) {
  const state = await load();
  const body = {
    userId: input.userId.trim(),
    password: input.password,
    captchaValue: input.captchaValue.trim(),
  };
  const headers = {
    Origin: "https://accounts.gabia.com",
    Referer: "https://accounts.gabia.com/",
    "Content-Type": "application/json",
  };

  const check = await gabiaFetch(state, "https://member-public-api.gabia.com/v1/auth/login/check-access", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const checkData = (await check.json().catch(() => ({}))) as {
    loginCode?: string;
    message?: string;
    errorCode?: string;
    errorMessage?: string;
  };

  if (checkData.loginCode && checkData.loginCode !== "ACCESS") {
    state.status = "error";
    state.message =
      checkData.loginCode === "OTP"
        ? "가비아에 OTP가 켜져 있습니다. OTP를 끈 뒤 다시 로그인하거나, 가비아 사이트에서 직접 로그인한 뒤 알려 주세요."
        : `가비아 추가 확인이 필요합니다 (${checkData.loginCode}).`;
    await save(state);
    return publicView(state);
  }

  const login = await gabiaFetch(state, "https://member-public-api.gabia.com/v1/auth/login", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const loginData = (await login.json().catch(() => ({}))) as {
    result?: boolean;
    message?: string;
    errorCode?: string;
    errorMessage?: string;
    redirectUrl?: string;
  };

  if (!login.ok || loginData.result === false || loginData.errorCode) {
    state.status = "login";
    state.message = loginData.errorMessage || loginData.message || "로그인에 실패했습니다. 보안 문자를 다시 받아 주세요.";
    const retry = await gabiaFetch(state, "https://member-public-api.gabia.com/v1/auth/login/retry-captcha", {
      headers: { Origin: "https://accounts.gabia.com", Referer: "https://accounts.gabia.com/" },
    });
    const retryData = (await retry.json().catch(() => ({}))) as { captchaInfo?: { captchaVcid?: string } };
    state.captchaVcid = retryData.captchaInfo?.captchaVcid ?? state.captchaVcid;
    await save(state);
    return publicView(state);
  }

  state.status = "ready";
  state.userId = body.userId;
  state.message = "가비아 로그인됨. DNS를 등록합니다.";
  await save(state);
  return gabiaApply();
}

function phpArray(records: Record<string, string>[], prefix: string) {
  const parts: string[] = [];
  records.forEach((record, index) => {
    for (const [key, value] of Object.entries(record)) {
      parts.push(`${prefix}[${index}][${key}]=${encodeURIComponent(value)}`);
    }
  });
  return parts.join("&");
}

export async function gabiaApply() {
  const state = await load();
  if (state.status !== "ready" && state.status !== "applied") {
    state.message = "먼저 가비아에 로그인하세요.";
    await save(state);
    return publicView(state);
  }

  const domain = company.apex;
  const list = await gabiaFetch(state, `https://dns.gabia.com/dns/ajax/dns?domain=${encodeURIComponent(domain)}`, {
    headers: { Referer: "https://dns.gabia.com/", "X-Requested-With": "XMLHttpRequest" },
  });

  if (list.status === 401) {
    state.status = "login";
    state.message = "가비아 세션이 끝났습니다. 다시 로그인하세요.";
    await save(state);
    return publicView(state);
  }

  const current = (await list.json().catch(() => ({}))) as {
    record?: { type?: string; host?: string; data?: string }[];
    message?: string;
  };
  const records = current.record ?? [];
  const hasWww = records.some(
    (row) => row.type === "CNAME" && (row.host === "www" || row.host === "www.ne1-tech.co.kr"),
  );

  if (hasWww) {
    state.status = "applied";
    state.applied = Array.from(new Set([...state.applied, "www CNAME"]));
    state.message = "www CNAME 은 이미 가비아에 있습니다.";
    await save(state);
    return publicView(state);
  }

  const add = [
    {
      seqno: "-1",
      status: "add",
      type: "CNAME",
      host: "www",
      data: `${company.dns.wwwTarget}.`,
      ttl: "1800",
      services_idx: "19",
      service: "",
      protocol: "",
      priority: "",
      weight: "",
      port: "",
      target: "",
    },
  ];
  const body = `domain=${encodeURIComponent(domain)}&${phpArray(add, "data")}`;
  const saveRes = await gabiaFetch(state, "https://dns.gabia.com/dns/ajax/dns", {
    method: "POST",
    headers: {
      Referer: "https://dns.gabia.com/",
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });
  const saved = (await saveRes.json().catch(() => ({}))) as { message?: string; result?: boolean };

  if (!saveRes.ok) {
    state.status = "error";
    state.message = saved.message || `가비아 DNS 저장에 실패했습니다 (${saveRes.status}).`;
    await save(state);
    return publicView(state);
  }

  state.status = "applied";
  state.applied = Array.from(new Set([...state.applied, "www CNAME"]));
  state.message = "가비아에 www CNAME(ne1-tech.co.kr.) 을 등록했습니다. 반영까지 시간이 걸릴 수 있습니다.";
  await save(state);
  return publicView(state);
}
