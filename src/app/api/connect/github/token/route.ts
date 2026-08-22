import { loginWithPersonalToken } from "@/lib/github-connect";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: string;
    repoName?: string;
    isPrivate?: boolean;
  } | null;
  const token = body?.token?.trim() ?? "";
  if (!token) {
    return Response.json({ status: "error", message: "토큰을 입력해 주세요." }, { status: 400 });
  }
  const state = await loginWithPersonalToken(token, {
    repoName: body?.repoName,
    isPrivate: body?.isPrivate,
  });
  return Response.json(state);
}
