import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifyEmailOtp } from "@/lib/email-otp";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; code?: string };
  const result = await verifyEmailOtp({
    email: body.email ?? "",
    code: body.code ?? "",
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  const response = NextResponse.json({
    ok: true,
    user: result.user,
    membership: "membership" in result ? result.membership : null,
    expiresAt: result.expiresAt,
  });
  response.cookies.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
