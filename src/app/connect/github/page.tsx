import { startGitHubDeviceFlow } from "@/lib/github-connect";
import { GitHubWorkWindow } from "@/components/github-work-window";

export const dynamic = "force-dynamic";

export default async function GitHubConnectPage() {
  const initial = await startGitHubDeviceFlow({ repoName: "ne1-tech-mall" });
  return <GitHubWorkWindow initial={initial} />;
}
