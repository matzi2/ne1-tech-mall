import { gabiaForeignSend } from "@/lib/gabia-connect";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: string; password?: string; channel?: "sms" | "ems" };
  if (!body.userId || !body.password || !body.channel) {
    return Response.json({ status: "error", message: "아이디와 인증 수단을 넣어 주세요." }, { status: 400 });
  }
  return Response.json(
    await gabiaForeignSend({ userId: body.userId, password: body.password, channel: body.channel }),
  );
}
