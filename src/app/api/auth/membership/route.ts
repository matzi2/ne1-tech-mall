import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSession } from "@/lib/email-otp";
import { isAdminEmail } from "@/lib/company";
import {
  cancelWithdrawal,
  getMember,
  listMembers,
  purgeExpiredMembers,
  upsertActiveMember,
  withdrawMember,
} from "@/lib/member-store";
import { daysUntil } from "@/lib/membership";

async function sessionOf() {
  const jar = await cookies();
  return getSession(jar.get(SESSION_COOKIE)?.value);
}

export async function GET(request: Request) {
  await purgeExpiredMembers();
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";
  const session = await sessionOf();

  if (url.searchParams.get("all") === "1") {
    if (!session || !isAdminEmail(session.email)) {
      return NextResponse.json({ ok: false, message: "관리자만 볼 수 있습니다." }, { status: 403 });
    }
    const members = await listMembers();
    return NextResponse.json({ ok: true, members });
  }

  const target = email || session?.email || "";
  if (!target) return NextResponse.json({ member: null });
  if (session && !isAdminEmail(session.email) && session.email !== target) {
    return NextResponse.json({ ok: false, message: "본인 계정만 조회됩니다." }, { status: 403 });
  }
  const member = await getMember(target);
  return NextResponse.json({
    ok: true,
    member,
    daysLeft: member?.purgeAt ? daysUntil(member.purgeAt) : 0,
  });
}

export async function POST(request: Request) {
  const session = await sessionOf();
  const body = (await request.json().catch(() => ({}))) as {
    action?: "withdraw" | "cancel" | "purge" | "register";
    email?: string;
    reason?: string;
    name?: string;
    role?: "member" | "business" | "admin";
  };
  const action = body.action ?? "withdraw";

  if (action === "purge") {
    if (!session || !isAdminEmail(session.email)) {
      return NextResponse.json({ ok: false, message: "관리자만 만료 삭제를 실행합니다." }, { status: 403 });
    }
    const purged = await purgeExpiredMembers();
    return NextResponse.json({ ok: true, purged });
  }

  if (action === "register") {
    if (!session) return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
    const member = await upsertActiveMember({
      email: session.email,
      name: body.name || session.name,
      role: session.role,
    });
    return NextResponse.json({ ok: true, member });
  }

  if (!session) {
    return NextResponse.json({ ok: false, message: "로그인한 뒤 탈퇴하거나 취소할 수 있습니다." }, { status: 401 });
  }

  const email = (body.email || session.email).trim().toLowerCase();
  if (!isAdminEmail(session.email) && email !== session.email) {
    return NextResponse.json({ ok: false, message: "본인 계정만 처리할 수 있습니다." }, { status: 403 });
  }

  if (action === "cancel") {
    const result = await cancelWithdrawal(email);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const result = await withdrawMember(email, body.reason);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
