import { cookies } from "next/headers";
import { SESSION_COOKIE, getSession } from "@/lib/email-otp";

export async function GET() {
  const jar = await cookies();
  const session = await getSession(jar.get(SESSION_COOKIE)?.value);
  if (!session) {
    return Response.json({ user: null });
  }
  return Response.json({ user: { email: session.email, name: session.name, role: session.role } });
}
