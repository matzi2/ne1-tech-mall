import { GitHubWindows } from "@/components/github-windows";

export const dynamic = "force-dynamic";

export default function AdminGitHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <GitHubWindows />
    </div>
  );
}
