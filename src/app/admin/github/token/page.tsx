import { GitHubConnectPanel } from "@/components/github-connect-panel";

export const dynamic = "force-dynamic";

export default function AdminGitHubTokenPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <GitHubConnectPanel />
    </div>
  );
}
