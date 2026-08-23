import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { company } from "@/lib/company";
import { HOSTING_WAN_IPV4 } from "@/lib/hosting";
import type { GabiaPublicState } from "@/lib/gabia-types";

export type { GabiaPublicState } from "@/lib/gabia-types";

const STATE_PATH = path.join("/tmp", "ne1-gabia-session.json");
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type StoredState = GabiaPublicState & {
  cookies: Record<string, string>;
  token: string | null;
  captchaVcid: string | null;
  foreignAuthToken: string | null;
};

function empty(): StoredState {
  return {
    status: "idle",
    userId: null,
    captchaSrc: "/api/connect/gabia/captcha",
    message: null,
    applied: [],
    foreignChannel: null,
    phoneMasked: null,
    emailMasked: null,
    lastAction: "idle",
    hasForeignToken: false,
    sendCount: 0,
    lastCheckedAt: null,
    cookies: {},
    token: null,
    captchaVcid: null,
    foreignAuthToken: null,
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
    foreignChannel: state.foreignChannel,
    phoneMasked: state.phoneMasked,
    emailMasked: state.emailMasked,
    lastAction: state.lastAction,
    hasForeignToken: Boolean(state.foreignAuthToken),
    sendCount: state.sendCount,
    lastCheckedAt: state.lastCheckedAt,
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

function extractAuthToken(data: unknown, depth = 0): string | null {
  if (depth > 4 || data == null || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  for (const key of ["auth_token", "authToken"]) {
    const value = record[key];
    if (typeof value === "string" && value.length > 8) return value;
  }
  if (record.data) return extractAuthToken(record.data, depth + 1);
  return null;
}

function omitEmpty(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

function normalizeAuthKey(value: string) {
  return value.replace(/\D/g, "");
}

export async function gabiaStatus() {
  const state = await load();
  if (state.status === "foreign" && state.userId && !state.phoneMasked) {
    await fillForeignContacts(state, state.userId);
    await save(state);
  }
  if (state.status === "foreign" && !state.foreignAuthToken) {
    state.message =
      "이전 인증번호는 더 이상 쓸 수 없습니다. 비밀번호를 넣고 인증번호를 다시 받은 뒤, 새로 온 숫자만 입력하세요.";
    state.lastAction = state.lastAction === "verify_fail" ? "verify_fail" : "login";
    await save(state);
  }
  return publicView(state);
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
  state.lastAction = "login";
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

type GabiaAuthJson = {
  result?: boolean;
  loginCode?: string;
  message?: string;
  errorCode?: string;
  errorMessage?: string;
  auth_token?: string;
  authToken?: string;
  redirectUrl?: string;
  data?: {
    loginCode?: string;
    gaSessionId?: string;
    needPwdChange?: boolean;
    message?: string;
    auth_token?: string;
    authToken?: string;
  };
};

function authMessage(data: GabiaAuthJson, context: "login" | "foreign" = "login") {
  const code = data.errorCode || "";
  const text = data.errorMessage || data.message || data.data?.message || "";
  if (context === "foreign") {
    if (text.includes("인증번호") || code === "GE0020") return text || "인증번호가 맞지 않습니다.";
    if (text.includes("토큰") || text.includes("인증토큰")) {
      return "인증번호 세션이 끝났습니다. 비밀번호를 넣고 인증번호를 다시 받으세요.";
    }
    return text || "해외 IP 인증에 실패했습니다.";
  }
  if (code === "GE0011" || code === "GE0012" || text.includes("보안")) {
    return "보안 문자가 맞지 않습니다. 그림을 새로고침한 뒤 다시 입력해 주세요.";
  }
  if (text.includes("인증토큰") || text.includes("토큰")) {
    return "로그인 토큰이 만료됐습니다. 보안 문자를 새로고침한 뒤 바로 입력해 주세요.";
  }
  if (text.includes("비밀번호") || text.includes("아이디") || code.startsWith("GE")) {
    return text || "아이디 또는 비밀번호를 확인해 주세요.";
  }
  return text || "로그인에 실패했습니다.";
}

function failedAuth(data: GabiaAuthJson, response: Response) {
  return !response.ok || data.result === false || Boolean(data.errorCode);
}

async function refreshCaptcha(state: StoredState) {
  const retry = await gabiaFetch(state, "https://member-public-api.gabia.com/v1/auth/login/retry-captcha", {
    headers: { Origin: "https://accounts.gabia.com", Referer: "https://accounts.gabia.com/" },
  });
  const retryData = (await retry.json().catch(() => ({}))) as { captchaInfo?: { captchaVcid?: string }; token?: string };
  state.captchaVcid = retryData.captchaInfo?.captchaVcid ?? state.captchaVcid;
  if (retryData.token) state.token = retryData.token;
}

export async function gabiaLogin(input: { userId: string; password: string; captchaValue: string }) {
  const state = await load();
  if (!state.token || !state.captchaVcid) {
    await gabiaInit();
    const next = await load();
    next.status = "login";
    next.lastAction = "login";
    next.message = "보안 문자를 다시 받은 뒤 바로 입력해 주세요.";
    await save(next);
    return publicView(next);
  }

  const payload = {
    userId: input.userId.trim(),
    password: input.password,
    token: state.token,
    captchaVcid: state.captchaVcid,
    captchaValue: input.captchaValue.trim(),
    saveIdFlag: false,
    useOtp: false,
    otpType: "OTP",
  };
  const headers = {
    Origin: "https://accounts.gabia.com",
    Referer: "https://accounts.gabia.com/",
    "Content-Type": "application/json",
  };

  const check = await gabiaFetch(state, "https://member-public-api.gabia.com/v1/auth/login/check-access", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const checkData = (await check.json().catch(() => ({}))) as GabiaAuthJson;
  const loginCode = checkData.loginCode || checkData.data?.loginCode;

  if (!check.ok || checkData.errorCode) {
    state.status = "login";
    state.lastAction = "login";
    state.message = authMessage(checkData);
    await refreshCaptcha(state);
    await save(state);
    return publicView(state);
  }

  if (loginCode === "FOREIGN" || loginCode === "OTP_FOREIGN") {
    state.status = "foreign";
    state.userId = payload.userId;
    state.foreignChannel = null;
    state.foreignAuthToken = null;
    state.lastAction = "login";
    await fillForeignContacts(state, payload.userId);
    state.message =
      loginCode === "OTP_FOREIGN"
        ? "해외 IP + OTP 입니다. 아래 휴대전화 또는 이메일로 먼저 인증해 주세요."
        : `이 작업 서버가 한국 밖이라 가비아가 해외 IP 인증을 요구합니다. 등록 번호 ${state.phoneMasked ?? ""} 또는 메일 ${state.emailMasked ?? ""} 로 인증번호를 받으세요.`;
    await save(state);
    return publicView(state);
  }

  if (loginCode && loginCode !== "ACCESS") {
    state.status = "error";
    state.lastAction = "login";
    state.message =
      loginCode === "OTP"
        ? "가비아에 OTP가 켜져 있습니다. OTP를 끈 뒤 이 창에서 다시 로그인하거나, 가비아 사이트에서 DNS를 넣어 주세요."
        : `가비아 추가 확인이 필요합니다 (${loginCode}).`;
    await save(state);
    return publicView(state);
  }

  return finishLogin(state, payload);
}

async function finishLogin(
  state: StoredState,
  payload: Record<string, unknown>,
  options: { afterForeign?: boolean } = {},
) {
  const attempts: Record<string, unknown>[] = options.afterForeign
    ? [
        omitEmpty({
          userId: payload.userId,
          password: payload.password,
          token: state.token,
          captchaVcid: state.captchaVcid,
          captchaValue: payload.captchaValue,
          saveIdFlag: false,
          useOtp: false,
          otpType: "OTP",
        }),
        { userId: payload.userId, password: payload.password, saveIdFlag: false, useOtp: false, otpType: "OTP" },
      ]
    : [
        {
          userId: payload.userId,
          password: payload.password,
          token: payload.token ?? state.token,
          captchaVcid: payload.captchaVcid ?? state.captchaVcid,
          captchaValue: payload.captchaValue,
          saveIdFlag: false,
          useOtp: false,
          otpType: "OTP",
        },
      ];

  let lastData: GabiaAuthJson = {};
  for (const body of attempts) {
    const login = await gabiaFetch(state, "https://member-public-api.gabia.com/v1/auth/login", {
      method: "POST",
      headers: {
        Origin: "https://accounts.gabia.com",
        Referer: "https://accounts.gabia.com/",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    lastData = (await login.json().catch(() => ({}))) as GabiaAuthJson;
    if (!failedAuth(lastData, login)) {
      const sessionId = lastData.data?.gaSessionId;
      if (sessionId) state.cookies.gasession = sessionId;
      state.status = "ready";
      state.userId = String(payload.userId);
      state.lastAction = "verify_ok";
      state.message = "가비아 로그인됨. DNS를 등록합니다.";
      await save(state);
      return gabiaApply();
    }
  }

  if (options.afterForeign) {
    state.status = "foreign";
    state.lastAction = "verify_fail";
    state.message = `해외 IP 인증은 됐습니다. 로그인 마무리에 실패했습니다. ${authMessage(lastData, "foreign")} 비밀번호와 인증번호를 다시 받아 주세요.`;
    await save(state);
    return publicView(state);
  }

  state.status = "login";
  state.lastAction = "login";
  state.message = authMessage(lastData);
  await refreshCaptcha(state);
  await save(state);
  return publicView(state);
}

function maskPhone(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length < 7) return value ?? null;
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

function maskEmail(value?: string | null) {
  if (!value || !value.includes("@")) return value ?? null;
  const [name, host] = value.split("@");
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, name.length - 2))}@${host}`;
}

async function fillForeignContacts(state: StoredState, userId: string) {
  const response = await gabiaFetch(
    state,
    `https://member-public-api.gabia.com/v1/auth/login/foreign-access?userId=${encodeURIComponent(userId)}`,
    { headers: { Origin: "https://accounts.gabia.com", Referer: "https://accounts.gabia.com/" } },
  );
  const data = (await response.json().catch(() => ({}))) as { phone?: string; email?: string };
  state.phoneMasked = maskPhone(data.phone);
  state.emailMasked = maskEmail(data.email);
}

export async function gabiaForeignSend(input: { userId: string; password: string; channel: "sms" | "ems" }) {
  const state = await load();
  await fillForeignContacts(state, input.userId.trim());
  const body = {
    userId: input.userId.trim(),
    userPwd: input.password,
    origin: "www",
    method: "Gabia",
  };
  const response = await gabiaFetch(
    state,
    `https://member-public-api.gabia.com/v1/auth/foreign-access/send/${input.channel}`,
    {
      method: "POST",
      headers: {
        Origin: "https://accounts.gabia.com",
        Referer: "https://accounts.gabia.com/",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const data = (await response.json().catch(() => ({}))) as GabiaAuthJson;
  if (failedAuth(data, response)) {
    state.status = "foreign";
    state.lastAction = "verify_fail";
    state.message =
      authMessage(data, "foreign") || "인증번호 발송에 실패했습니다. 비밀번호를 다시 넣고 눌러 주세요.";
    await save(state);
    return publicView(state);
  }
  const token = extractAuthToken(data);
  state.status = "foreign";
  state.userId = input.userId.trim();
  state.foreignChannel = input.channel;
  state.foreignAuthToken = token ?? state.foreignAuthToken;
  state.sendCount += 1;
  state.lastCheckedAt = new Date().toISOString();
  state.lastAction = input.channel === "sms" ? "sms_sent" : "email_sent";
  const dest = input.channel === "sms" ? state.phoneMasked : state.emailMasked;
  state.message = token
    ? `${dest ?? (input.channel === "sms" ? "휴대전화" : "이메일")}로 ${state.sendCount}번째 인증번호를 보냈습니다. 가장 마지막 문자만 유효합니다.`
    : "인증번호는 보냈지만 확인 토큰을 받지 못했습니다. 비밀번호를 확인하고 한 번 더 보내 주세요.";
  await save(state);
  return publicView(state);
}

export async function gabiaForeignVerify(input: {
  userId: string;
  password: string;
  authKey: string;
  captchaValue: string;
}) {
  const state = await load();
  if (!state.foreignAuthToken) {
    state.status = "foreign";
    state.lastAction = "verify_fail";
    state.message =
      "인증번호 확인 토큰이 없습니다. 화면에 변화가 없던 이유입니다. 비밀번호를 넣고 인증번호를 다시 받은 뒤, 새로 온 숫자만 입력하세요.";
    await save(state);
    return publicView(state);
  }

  const channel = state.foreignChannel ?? "sms";
  const authKey = normalizeAuthKey(input.authKey);
  if (authKey.length < 4) {
    state.status = "foreign";
    state.lastAction = "verify_fail";
    state.message = "인증번호는 문자로 받은 숫자만 넣어 주세요. DNS는 아직 등록되지 않았습니다.";
    await save(state);
    return publicView(state);
  }
  const body = {
    userId: input.userId.trim(),
    userPwd: input.password,
    origin: "www",
    authKey,
    authToken: state.foreignAuthToken,
  };
  const response = await gabiaFetch(
    state,
    `https://member-public-api.gabia.com/v1/auth/foreign-access/verify/${channel}`,
    {
      method: "POST",
      headers: {
        Origin: "https://accounts.gabia.com",
        Referer: "https://accounts.gabia.com/",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const data = (await response.json().catch(() => ({}))) as GabiaAuthJson;
  state.lastCheckedAt = new Date().toISOString();
  if (failedAuth(data, response)) {
    state.status = "foreign";
    state.lastAction = "verify_fail";
    state.message =
      `${authMessage(data, "foreign") || "인증번호가 맞지 않습니다."} DNS는 아직 등록되지 않았습니다. 가장 마지막 문자 숫자만 넣거나, 인증번호를 다시 받으세요.`;
    await save(state);
    return publicView(state);
  }

  state.lastAction = "verify_ok";
  state.message = "해외 IP 인증이 됐습니다. 로그인과 DNS를 이어서 진행합니다.";
  await save(state);
  return finishLogin(
    state,
    {
      userId: input.userId.trim(),
      password: input.password,
      captchaValue: input.captchaValue,
    },
    { afterForeign: true },
  );
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

function isApexHost(host?: string) {
  const value = (host ?? "").replace(/\.$/, "").toLowerCase();
  return value === "" || value === "@" || value === company.apex;
}

function newGabiaRecord(type: string, host: string, data: string, extra: Record<string, string> = {}) {
  return {
    seqno: "-1",
    status: "add",
    type,
    host,
    data,
    ttl: "1800",
    services_idx: extra.services_idx ?? "",
    service: "",
    protocol: "",
    priority: extra.priority ?? "",
    weight: "",
    port: "",
    target: "",
  };
}

export async function gabiaApply(input: { ipv4?: string } = {}) {
  const state = await load();
  if (state.status !== "ready" && state.status !== "applied") {
    state.lastAction = "dns_fail";
    state.message = "먼저 가비아에 로그인하세요. 해외 IP면 인증번호를 확인한 뒤 A 레코드를 등록합니다.";
    await save(state);
    return publicView(state);
  }

  const ipv4 = (input.ipv4 || HOSTING_WAN_IPV4).trim();
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ipv4)) {
    state.lastAction = "dns_fail";
    state.message = "A 레코드에 넣을 공인 IPv4가 없습니다.";
    await save(state);
    return publicView(state);
  }

  const domain = company.apex;
  const list = await gabiaFetch(state, `https://dns.gabia.com/dns/ajax/dns?domain=${encodeURIComponent(domain)}`, {
    headers: { Referer: "https://dns.gabia.com/", "X-Requested-With": "XMLHttpRequest" },
  });

  if (list.status === 401) {
    state.status = "login";
    state.lastAction = "dns_fail";
    state.message = "가비아 세션이 끝났습니다. 다시 로그인하세요.";
    await save(state);
    return publicView(state);
  }

  const current = (await list.json().catch(() => ({}))) as {
    record?: { type?: string; host?: string; data?: string; seqno?: string | number }[];
    message?: string;
  };
  const records = current.record ?? [];
  const hasWww = records.some(
    (row) => row.type === "CNAME" && (row.host === "www" || row.host === "www.ne1-tech.co.kr"),
  );
  const apexA = records.find((row) => row.type === "A" && isApexHost(row.host));
  const done = [...state.applied];
  const add: ReturnType<typeof newGabiaRecord>[] = [];

  if (!hasWww) {
    add.push(newGabiaRecord("CNAME", "www", `${company.dns.wwwTarget}.`, { services_idx: "19" }));
  } else {
    done.push("www CNAME");
  }

  if (!apexA) {
    add.push(newGabiaRecord("A", "@", ipv4));
  } else if ((apexA.data ?? "").trim() === ipv4) {
    done.push(`A @ ${ipv4}`);
  } else if (apexA.seqno != null) {
    add.push({
      ...newGabiaRecord("A", "@", ipv4),
      seqno: String(apexA.seqno),
      status: "mod",
    });
  } else {
    add.push(newGabiaRecord("A", "@", ipv4));
  }

  if (!add.length) {
    state.status = "applied";
    state.lastAction = "dns_ok";
    state.applied = Array.from(new Set(done));
    state.message = `가비아에 필요한 값이 있습니다. A(@) ${ipv4} · www CNAME. MX·SPF·NS는 그대로 둡니다.`;
    await save(state);
    return publicView(state);
  }

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
    state.lastAction = "dns_fail";
    state.message = saved.message || `가비아 DNS 저장에 실패했습니다 (${saveRes.status}).`;
    await save(state);
    return publicView(state);
  }

  if (add.some((row) => row.type === "A")) done.push(`A @ ${ipv4}`);
  if (add.some((row) => row.type === "CNAME")) done.push("www CNAME");

  state.status = "applied";
  state.lastAction = "dns_ok";
  state.applied = Array.from(new Set(done));
  state.message = `가비아에 A(@) ${ipv4} 를 등록했습니다. MX·SPF·NS·www는 유지합니다. 반영까지 시간이 걸릴 수 있습니다.`;
  await save(state);
  return publicView(state);
}
