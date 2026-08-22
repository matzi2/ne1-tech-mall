import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, clearSession } from "@/lib/email-otp";

export async function POST() {
  const jar = await cookies();
  await clearSession(jar.get(SESSION_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
