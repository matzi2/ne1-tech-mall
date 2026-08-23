"use client";

import { useState } from "react";
import { GitHubConnectPanel } from "@/components/github-connect-panel";
import { GitHubDesk } from "@/components/github-desk";

export function GitHubWindows() {
  const [username, setUsername] = useState("");

  return (
    <div className="space-y-6">
      <GitHubDesk username={username} onUsernameChange={setUsername} />
      <GitHubConnectPanel username={username} />
    </div>
  );
}
