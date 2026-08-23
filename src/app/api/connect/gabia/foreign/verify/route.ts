import { gabiaForeignVerify } from "@/lib/gabia-connect";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
    password?: string;
    authKey?: string;
    captchaValue?: string;
  };
  if (!body.userId || !body.password || !body.authKey) {
    return Response.json({ status: "error", message: "인증번호를 입력해 주세요." }, { status: 400 });
  }
  return Response.json(
    await gabiaForeignVerify({
      userId: body.userId,
      password: body.password,
      authKey: body.authKey,
      captchaValue: body.captchaValue ?? "",
    }),
  );
}
