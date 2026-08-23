import { gabiaLogin } from "@/lib/gabia-connect";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: string; password?: string; captchaValue?: string };
  if (!body.userId || !body.password || !body.captchaValue) {
    return Response.json({ status: "error", message: "아이디, 비밀번호, 보안 문자를 모두 넣으세요." }, { status: 400 });
  }
  return Response.json(
    await gabiaLogin({
      userId: body.userId,
      password: body.password,
      captchaValue: body.captchaValue,
    }),
  );
}
