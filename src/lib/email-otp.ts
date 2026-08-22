import { createHash, randomBytes, randomInt } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoAccounts, type Role } from "@/lib/company";

const OTP_PATH = path.join("/tmp", "ne1-email-otp.json");
const SESSION_PATH = path.join("/tmp", "ne1-email-sessions.json");
const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_COOKIE = "ne1_session";

export type SessionProfile = {
  email: string;
  name: string;
  role: Role;
};

type OtpRecord = {
  email: string;
  codeHash: string;
  expiresAt: string;
  name?: string;
  role?: Role;
};

type SessionRecord = SessionProfile & {
  token: string;
  expiresAt: string;
};

type OtpFile = Record<string, OtpRecord>;
type SessionFile = Record<string, SessionRecord>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function hashCode(email: string, code: string) {
  return createHash("sha256").update(`${email}:${code}:ne1-otp`).digest("hex");
}

export function profileForEmail(email: string, name?: string, role?: Role): SessionProfile {
  const normalized = normalizeEmail(email);
  const demo = demoAccounts.find((account) => account.email === normalized);
  if (demo) {
    return { email: demo.email, name: demo.name, role: demo.role };
  }
  return {
    email: normalized,
    name: name?.trim() || normalized.split("@")[0] || "회원",
    role: role ?? "member",
  };
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return { ...fallback, ...(JSON.parse(await readFile(file, "utf8")) as T) };
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value, null, 2));
}

export async function startEmailOtp(input: { email: string; name?: string; role?: Role }) {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    return { ok: false as const, message: "올바른 이메일을 입력해 주세요." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const otps = await readJson<OtpFile>(OTP_PATH, {});
  otps[email] = {
    email,
    codeHash: hashCode(email, code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    name: input.name?.trim(),
    role: input.role,
  };
  await writeJson(OTP_PATH, otps);

  return {
    ok: true as const,
    email,
    expiresAt: otps[email].expiresAt,
    oneTimePassword: code,
    message: "1회용 비밀번호를 이 작업창에 표시했습니다. 서버에는 저장하지 않습니다.",
  };
}

export async function verifyEmailOtp(input: { email: string; code: string }) {
  const email = normalizeEmail(input.email);
  const code = input.code.replace(/\D/g, "");
  const otps = await readJson<OtpFile>(OTP_PATH, {});
  const record = otps[email];
  if (!record) {
    return { ok: false as const, message: "1회용 비밀번호를 먼저 받아 주세요." };
  }
  if (Date.parse(record.expiresAt) < Date.now()) {
    delete otps[email];
    await writeJson(OTP_PATH, otps);
    return { ok: false as const, message: "1회용 비밀번호가 만료되었습니다. 다시 받아 주세요." };
  }
  if (record.codeHash !== hashCode(email, code)) {
    return { ok: false as const, message: "1회용 비밀번호가 맞지 않습니다." };
  }

  delete otps[email];
  await writeJson(OTP_PATH, otps);

  const profile = profileForEmail(email, record.name, record.role);
  const token = randomBytes(32).toString("hex");
  const sessions = await readJson<SessionFile>(SESSION_PATH, {});
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  sessions[token] = { ...profile, token, expiresAt };
  await writeJson(SESSION_PATH, sessions);

  return { ok: true as const, token, expiresAt, user: profile };
}

export async function getSession(token: string | undefined | null) {
  if (!token) return null;
  const sessions = await readJson<SessionFile>(SESSION_PATH, {});
  const record = sessions[token];
  if (!record) return null;
  if (Date.parse(record.expiresAt) < Date.now()) {
    delete sessions[token];
    await writeJson(SESSION_PATH, sessions);
    return null;
  }
  return { email: record.email, name: record.name, role: record.role, expiresAt: record.expiresAt };
}

export async function clearSession(token: string | undefined | null) {
  if (!token) return;
  const sessions = await readJson<SessionFile>(SESSION_PATH, {});
  delete sessions[token];
  await writeJson(SESSION_PATH, sessions);
}
