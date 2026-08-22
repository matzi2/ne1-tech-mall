import { pollGitHubDeviceFlow } from "@/lib/github-connect";

export async function POST() {
  const state = await pollGitHubDeviceFlow();
  return Response.json(state);
}
