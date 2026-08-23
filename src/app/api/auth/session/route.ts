import { cookies } from "next/headers";
import { SESSION_COOKIE, getSession } from "@/lib/email-otp";
import { getMember, purgeExpiredMembers } from "@/lib/member-store";

export async function GET() {
  const jar = await cookies();
  const session = await getSession(jar.get(SESSION_COOKIE)?.value);
  if (!session) {
    return Response.json({ user: null });
  }
  await purgeExpiredMembers();
  const membership = await getMember(session.email);
  return Response.json({
    user: { email: session.email, name: session.name, role: session.role },
    membership,
  });
}
