import { loginWithUsername } from "@/lib/github-connect";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    repoName?: string;
    isPrivate?: boolean;
  } | null;
  const state = await loginWithUsername({
    username: body?.username?.trim() ?? "",
    repoName: body?.repoName,
    isPrivate: Boolean(body?.isPrivate),
  });
  const status = state.status === "error" ? 400 : 200;
  return Response.json(state, { status });
}
