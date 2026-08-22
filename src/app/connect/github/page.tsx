"use client";

import { Suspense } from "react";
import { GitHubConnectPanel } from "@/components/github-connect-panel";

export default function GitHubConnectPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Suspense fallback={<p className="text-sm text-slate-500">GitHub 연결 창을 준비하는 중입니다.</p>}>
        <GitHubConnectPanel />
      </Suspense>
    </div>
  );
}
