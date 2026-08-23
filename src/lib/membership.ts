import { isAdminEmail, type Role } from "@/lib/company";

export const MEMBER_RETENTION_DAYS = 30;

export type MemberStatus = "active" | "withdrawn";

export type MemberRecord = {
  email: string;
  name: string;
  role: Role;
  status: MemberStatus;
  createdAt: string;
  withdrawnAt?: string;
  purgeAt?: string;
  withdrawReason?: string;
};

export function normalizeMemberEmail(value: string) {
  return value.trim().toLowerCase();
}

export function daysUntil(iso?: string) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / (24 * 60 * 60 * 1000)));
}

export function isPurgeDue(member: { status?: MemberStatus; purgeAt?: string }) {
  if (member.status !== "withdrawn" || !member.purgeAt) return false;
  return Date.parse(member.purgeAt) <= Date.now();
}

export function formatMemberDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export function canWithdraw(email: string) {
  return !isAdminEmail(email);
}

export function retentionLabel() {
  return `${MEMBER_RETENTION_DAYS}일`;
}
