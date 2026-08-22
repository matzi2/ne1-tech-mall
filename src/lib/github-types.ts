export type GitHubConnectState = {
  status: "idle" | "pending" | "authorized" | "published" | "error";
  userCode: string | null;
  verificationUri: string;
  verificationUriComplete: string | null;
  interval: number;
  expiresAt: string | null;
  login: string | null;
  name: string | null;
  htmlUrl: string | null;
  repoName: string;
  isPrivate: boolean;
  repoUrl: string | null;
  repoHtmlUrl: string | null;
  message: string | null;
  startedAt: string | null;
};

export type GitHubConnectInput = {
  force?: boolean;
  repoName?: string;
  isPrivate?: boolean;
};
