import { clearNasSession, loginNas, readNasSession } from "@/lib/nas-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await readNasSession());
}

export async function DELETE() {
  await clearNasSession();
  return Response.json(await readNasSession());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    otp?: string;
  };
  const state = await loginNas({
    host: body.host ?? "",
    port: typeof body.port === "number" ? body.port : undefined,
    username: body.username ?? "",
    password: body.password ?? "",
    otp: body.otp ?? "",
  });
  return Response.json(state, { status: state.connected ? 200 : 400 });
}
