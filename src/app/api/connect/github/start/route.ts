import { startGitHubDeviceFlow } from "@/lib/github-connect";
import type { GitHubConnectInput } from "@/lib/github-types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GitHubConnectInput;
  const state = await startGitHubDeviceFlow(body);
  return Response.json(state);
}
