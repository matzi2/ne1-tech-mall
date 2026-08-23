import { GitHubDesk } from "@/components/github-desk";

export const dynamic = "force-dynamic";

export default function AdminGitHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <GitHubDesk />
    </div>
  );
}
