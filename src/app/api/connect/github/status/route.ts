import { getGitHubPublicState } from "@/lib/github-connect";

export async function GET() {
  const state = await getGitHubPublicState();
  return Response.json(state);
}
