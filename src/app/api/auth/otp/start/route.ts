import { startEmailOtp } from "@/lib/email-otp";
import type { Role } from "@/lib/company";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    role?: Role;
  };
  const result = await startEmailOtp({
    email: body.email ?? "",
    name: body.name,
    role: body.role,
  });
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
