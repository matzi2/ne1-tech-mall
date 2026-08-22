import { loginWithPersonalToken } from "@/lib/github-connect";

async function readInput(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      token?: string;
      repoName?: string;
      isPrivate?: boolean;
    } | null;
    return {
      token: body?.token?.trim() ?? "",
      repoName: body?.repoName,
      isPrivate: Boolean(body?.isPrivate),
      form: false,
    };
  }
  const form = await request.formData().catch(() => null);
  return {
    token: String(form?.get("token") ?? "").trim(),
    repoName: String(form?.get("repoName") ?? "ne1-tech-mall"),
    isPrivate: String(form?.get("isPrivate") ?? "") === "on",
    form: true,
  };
}

export async function POST(request: Request) {
  const input = await readInput(request);
  if (!input.token) {
    if (input.form) {
      return Response.redirect(new URL("/connect/github?error=token", request.url), 303);
    }
    return Response.json({ status: "error", message: "토큰을 입력해 주세요." }, { status: 400 });
  }
  const state = await loginWithPersonalToken(input.token, {
    repoName: input.repoName,
    isPrivate: input.isPrivate,
  });
  if (input.form) {
    const url = new URL("/connect/github", request.url);
    if (state.status === "published" || state.status === "authorized") {
      url.searchParams.set("done", "1");
    } else {
      url.searchParams.set("error", state.message ?? "연결에 실패했습니다.");
    }
    return Response.redirect(url, 303);
  }
  return Response.json(state);
}
