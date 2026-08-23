import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isAdminEmail, type Role } from "@/lib/company";
import {
  MEMBER_RETENTION_DAYS,
  canWithdraw,
  isPurgeDue,
  normalizeMemberEmail,
  type MemberRecord,
} from "@/lib/membership";

const MEMBER_PATH = path.join("/tmp", "ne1-members.json");

type MemberFile = Record<string, MemberRecord>;

async function readMembers(): Promise<MemberFile> {
  try {
    return JSON.parse(await readFile(MEMBER_PATH, "utf8")) as MemberFile;
  } catch {
    return {};
  }
}

async function writeMembers(value: MemberFile) {
  await mkdir(path.dirname(MEMBER_PATH), { recursive: true });
  await writeFile(MEMBER_PATH, JSON.stringify(value, null, 2));
}

export async function getMember(email: string) {
  const members = await readMembers();
  return members[normalizeMemberEmail(email)] ?? null;
}

export async function upsertActiveMember(input: { email: string; name: string; role: Role }) {
  const email = normalizeMemberEmail(input.email);
  const members = await readMembers();
  const current = members[email];
  if (current?.status === "withdrawn" && !isPurgeDue(current)) return current;
  members[email] = {
    email,
    name: input.name.trim() || current?.name || email.split("@")[0] || "회원",
    role: isAdminEmail(email) ? "admin" : input.role,
    status: "active",
    createdAt: current?.createdAt ?? new Date().toISOString(),
  };
  await writeMembers(members);
  return members[email];
}

export async function withdrawMember(email: string, reason?: string) {
  const normalized = normalizeMemberEmail(email);
  if (!canWithdraw(normalized)) {
    return { ok: false as const, message: "관리자 계정은 탈퇴할 수 없습니다." };
  }
  const members = await readMembers();
  const current = members[normalized];
  if (!current) {
    return { ok: false as const, message: "가입 정보를 찾지 못했습니다." };
  }
  if (current.status === "withdrawn") {
    return { ok: true as const, member: current, message: "이미 탈퇴 대기 중입니다." };
  }
  const now = Date.now();
  members[normalized] = {
    ...current,
    status: "withdrawn",
    withdrawnAt: new Date(now).toISOString(),
    purgeAt: new Date(now + MEMBER_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    withdrawReason: reason?.trim() || undefined,
  };
  await writeMembers(members);
  return { ok: true as const, member: members[normalized] };
}

export async function cancelWithdrawal(email: string) {
  const normalized = normalizeMemberEmail(email);
  const members = await readMembers();
  const current = members[normalized];
  if (!current) return { ok: false as const, message: "가입 정보를 찾지 못했습니다." };
  if (current.status !== "withdrawn") return { ok: true as const, member: current };
  if (isPurgeDue(current)) {
    return { ok: false as const, message: "보관 기간이 끝나 복구할 수 없습니다. 다시 가입해 주세요." };
  }
  members[normalized] = {
    email: current.email,
    name: current.name,
    role: current.role,
    status: "active",
    createdAt: current.createdAt,
  };
  await writeMembers(members);
  return { ok: true as const, member: members[normalized] };
}

export async function listMembers() {
  const members = await readMembers();
  return Object.values(members).sort((a, b) => a.email.localeCompare(b.email));
}

export async function purgeExpiredMembers() {
  const members = await readMembers();
  const purged: MemberRecord[] = [];
  for (const [email, member] of Object.entries(members)) {
    if (!isPurgeDue(member)) continue;
    purged.push(member);
    delete members[email];
  }
  if (purged.length) await writeMembers(members);
  return purged;
}
