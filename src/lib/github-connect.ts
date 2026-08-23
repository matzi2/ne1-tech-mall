import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GitHubConnectInput, GitHubConnectState } from "@/lib/github-types";

export type { GitHubConnectInput, GitHubConnectState } from "@/lib/github-types";

const execFileAsync = promisify(execFile);

/** GitHub CLI 공개 OAuth client_id. 승인 화면에 GitHub CLI로 표시됩니다. */
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? "178c6fc778ccc68e1d6a";
const STATE_PATH = path.join("/tmp", "ne1-github-connect.json");
const REPO_NAME = process.env.GITHUB_REPO_NAME ?? "ne1-tech-mall";

function sanitizeRepoName(value?: string) {
  const cleaned = (value ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.slice(0, 100);
}

type StoredState = GitHubConnectState & {
  deviceCode: string | null;
  accessToken: string | null;
  lastPollAt?: string | null;
  expectedLogin?: string | null;
};

const emptyState = (): StoredState => ({
  status: "idle",
  userCode: null,
  verificationUri: "https://github.com/login/device",
  verificationUriComplete: null,
  interval: 5,
  expiresAt: null,
  login: null,
  name: null,
  htmlUrl: null,
  repoUrl: null,
  repoHtmlUrl: null,
  message: null,
  startedAt: null,
  repoName: REPO_NAME,
  isPrivate: false,
  deviceCode: null,
  accessToken: null,
  lastPollAt: null,
});

function publicView(state: StoredState): GitHubConnectState {
  const {
    deviceCode: _deviceCode,
    accessToken: _accessToken,
    lastPollAt: _lastPollAt,
    expectedLogin: _expectedLogin,
    ...visible
  } = state;
  return visible;
}

async function readState(): Promise<StoredState> {
  try {
    const raw = await readFile(STATE_PATH, "utf8");
    return { ...emptyState(), ...(JSON.parse(raw) as StoredState) };
  } catch {
    return emptyState();
  }
}

async function writeState(state: StoredState) {
  await mkdir(path.dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
}

export async function getGitHubPublicState(): Promise<GitHubConnectState> {
  return publicView(await readState());
}

async function readGhToken(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("gh", ["auth", "token"], { timeout: 8_000 });
    const token = stdout.trim();
    return token || null;
  } catch {
    return null;
  }
}

export async function loginWithUsername(input: GitHubConnectInput = {}): Promise<GitHubConnectState> {
  const username = (input.username ?? "").trim();
  if (!username) {
    const failed = emptyState();
    failed.status = "error";
    failed.message = "GitHub 아이디를 입력해 주세요.";
    return publicView(failed);
  }

  const current = await readState();
  const token = current.accessToken || (await readGhToken());
  if (!token) {
    const failed = emptyState();
    failed.status = "error";
    failed.message = "이 작업 서버에 GitHub 세션이 없습니다. 토큰 창에서 Personal Access Token을 넣으세요.";
    return publicView(failed);
  }

  const next: StoredState = {
    ...emptyState(),
    ...current,
    status: "authorized",
    accessToken: token,
    expectedLogin: username,
    repoName: sanitizeRepoName(input.repoName) || current.repoName || REPO_NAME,
    isPrivate: Boolean(input.isPrivate),
    startedAt: new Date().toISOString(),
    deviceCode: null,
    userCode: null,
    message: "아이디로 로그인하는 중입니다.",
  };

  try {
    const user = await githubApi(token, "https://api.github.com/user");
    const login = String(user.login ?? "");
    if (!login) throw new Error("GitHub 사용자 정보를 읽지 못했습니다.");
    next.login = login;
    next.name = typeof user.name === "string" ? user.name : login;
    next.htmlUrl = typeof user.html_url === "string" ? user.html_url : `https://github.com/${login}`;
    const repoName = sanitizeRepoName(next.repoName) || REPO_NAME;
    next.repoName = repoName;
    const repo = await fetch(`https://api.github.com/repos/${login}/${repoName}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "ne1-tech-mall",
      },
    });
    if (repo.ok) {
      const repoJson = (await repo.json()) as { html_url?: string; clone_url?: string };
      next.repoHtmlUrl = repoJson.html_url ?? `https://github.com/${login}/${repoName}`;
      next.repoUrl = repoJson.clone_url ?? `https://github.com/${login}/${repoName}.git`;
      next.status = "published";
    } else {
      next.repoHtmlUrl = `https://github.com/${login}/${repoName}`;
      next.repoUrl = `https://github.com/${login}/${repoName}.git`;
      next.status = "authorized";
    }
    next.message = `${login} 계정으로 로그인됐습니다.`;
    await writeState(next);
  } catch (error) {
    next.status = "error";
    next.message = error instanceof Error ? error.message : "로그인에 실패했습니다.";
    await writeState(next);
  }

  return publicView(await readState());
}

export async function startGitHubDeviceFlow(input: GitHubConnectInput = {}): Promise<GitHubConnectState> {
  const repoName = sanitizeRepoName(input.repoName) || REPO_NAME;
  const isPrivate = Boolean(input.isPrivate);
  const current = await readState();
  const stillValid =
    !input.force &&
    current.status === "pending" &&
    current.deviceCode &&
    current.expiresAt &&
    Date.parse(current.expiresAt) - Date.now() > 30_000;
  if (stillValid) {
    current.repoName = repoName;
    current.isPrivate = isPrivate;
    await writeState(current);
    return publicView(current);
  }

  const response = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "ne1-tech-mall",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: "repo read:org gist workflow",
    }),
  });
  const data = (await response.json()) as {
    device_code?: string;
    user_code?: string;
    verification_uri?: string;
    verification_uri_complete?: string;
    expires_in?: number;
    interval?: number;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !data.device_code || !data.user_code) {
    const next = emptyState();
    next.status = "error";
    next.message = data.error_description ?? data.error ?? "GitHub 장치 코드를 발급하지 못했습니다.";
    await writeState(next);
    return publicView(next);
  }

  const next: StoredState = {
    ...emptyState(),
    status: "pending",
    userCode: data.user_code,
    verificationUri: data.verification_uri ?? "https://github.com/login/device",
    verificationUriComplete:
      data.verification_uri_complete ??
      `https://github.com/login/device?user_code=${encodeURIComponent(data.user_code)}`,
    interval: data.interval ?? 5,
    expiresAt: new Date(Date.now() + (data.expires_in ?? 900) * 1000).toISOString(),
    startedAt: new Date().toISOString(),
    deviceCode: data.device_code,
    repoName,
    isPrivate,
    message: "보이는 Chrome에서 github.com/login/device 를 연 뒤 이 코드를 입력하세요.",
  };
  await writeState(next);
  return publicView(next);
}

export async function pollGitHubDeviceFlow(): Promise<GitHubConnectState> {
  const current = await readState();
  if (current.status === "published" || current.status === "authorized") {
    return publicView(current);
  }
  if (!current.deviceCode || current.status !== "pending") {
    return publicView(current);
  }
  if (current.expiresAt && Date.parse(current.expiresAt) < Date.now()) {
    current.status = "error";
    current.message = "코드가 만료되었습니다. 다시 연결을 시작해 주세요.";
    await writeState(current);
    return publicView(current);
  }

  const minWaitMs = Math.max(5, current.interval || 5) * 1000;
  if (current.lastPollAt && Date.now() - Date.parse(current.lastPollAt) < minWaitMs) {
    return publicView(current);
  }
  current.lastPollAt = new Date().toISOString();
  await writeState(current);

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "ne1-tech-mall",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      device_code: current.deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    }),
  });
  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
    interval?: number;
  };

  if (data.error === "authorization_pending" || data.error === "slow_down") {
    current.message =
      data.error === "slow_down"
        ? "GitHub 승인은 됐습니다. 요청 제한이 풀리면 저장소를 만듭니다."
        : "GitHub 창에서 코드를 입력하고 Authorize를 눌러 주세요.";
    if (typeof data.interval === "number" && data.interval > 0) {
      current.interval = data.interval;
    } else if (data.error === "slow_down") {
      current.interval = Math.min(current.interval + 10, 60);
    }
    await writeState(current);
    return publicView(current);
  }

  if (data.error || !data.access_token) {
    current.status = "error";
    current.message = data.error_description ?? data.error ?? "GitHub 승인이 완료되지 않았습니다.";
    await writeState(current);
    return publicView(current);
  }

  current.accessToken = data.access_token;
  current.status = "authorized";
  current.message = "GitHub 계정 권한이 확인되었습니다. 저장소를 만드는 중입니다.";
  await writeState(current);

  try {
    await publishToGitHub(current);
  } catch (error) {
    current.status = "authorized";
    current.message =
      error instanceof Error
        ? `로그인은 됐습니다. 저장소 푸시 중 오류: ${error.message}`
        : "로그인은 됐습니다. 저장소 푸시에 실패했습니다.";
    await writeState(current);
  }

  return publicView(await readState());
}

export async function loginWithPersonalToken(
  token: string,
  input: GitHubConnectInput = {},
): Promise<GitHubConnectState> {
  const trimmed = token.trim();
  if (!trimmed.startsWith("ghp_") && !trimmed.startsWith("github_pat_")) {
    const failed = emptyState();
    failed.status = "error";
    failed.message =
      "GitHub 계정 비밀번호는 이 창에서 쓸 수 없습니다. github.com에서 만든 Personal Access Token(ghp_ 또는 github_pat_)을 넣으세요.";
    return publicView(failed);
  }
  const current: StoredState = {
    ...emptyState(),
    status: "authorized",
    accessToken: trimmed,
    expectedLogin: input.username?.trim() || null,
    repoName: sanitizeRepoName(input.repoName) || REPO_NAME,
    isPrivate: Boolean(input.isPrivate),
    startedAt: new Date().toISOString(),
    message: "토큰으로 GitHub에 연결합니다.",
  };
  await writeState(current);
  try {
    await publishToGitHub(current);
  } catch (error) {
    current.status = "error";
    current.message = error instanceof Error ? error.message : "토큰 연결에 실패했습니다.";
    current.accessToken = null;
    await writeState(current);
  }
  return publicView(await readState());
}

async function githubApi(token: string, url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "ne1-tech-mall",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!response.ok) {
    const message =
      typeof json.message === "string" ? json.message : `GitHub API ${response.status}`;
    throw new Error(message);
  }
  return json;
}

async function publishToGitHub(state: StoredState) {
  if (!state.accessToken) throw new Error("GitHub 토큰이 없습니다.");
  const token = state.accessToken;
  const user = await githubApi(token, "https://api.github.com/user");
  const login = String(user.login ?? "");
  if (!login) throw new Error("GitHub 사용자 정보를 읽지 못했습니다.");
  const expected = (state.expectedLogin ?? "").trim();
  if (expected && expected.toLowerCase() !== login.toLowerCase()) {
    throw new Error(`토큰 계정(${login})과 입력한 아이디(${expected})가 다릅니다.`);
  }
  state.login = login;
  state.name = typeof user.name === "string" ? user.name : login;
  state.htmlUrl = typeof user.html_url === "string" ? user.html_url : `https://github.com/${login}`;
  await writeState(state);

  const repoName = sanitizeRepoName(state.repoName) || REPO_NAME;
  state.repoName = repoName;
  const repoApi = `https://api.github.com/repos/${login}/${repoName}`;
  let repo = await fetch(repoApi, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "ne1-tech-mall",
    },
  });
  if (repo.status === 404) {
    await githubApi(token, "https://api.github.com/user/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: repoName,
        description: "엔이원텍(NE1-TECH) 산업용 전자부품 쇼핑몰",
        private: state.isPrivate,
        has_issues: true,
        auto_init: false,
      }),
    });
    repo = await fetch(repoApi, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "ne1-tech-mall",
      },
    });
  }
  if (!repo.ok) {
    throw new Error("GitHub 저장소를 만들거나 찾지 못했습니다.");
  }
  const repoJson = (await repo.json()) as { html_url?: string; clone_url?: string };
  state.repoHtmlUrl = repoJson.html_url ?? `https://github.com/${login}/${repoName}`;
  state.repoUrl = repoJson.clone_url ?? `https://github.com/${login}/${repoName}.git`;
  await writeState(state);

  await saveGhToken(token);
  await pushToGitHub(token, login, repoName);

  state.status = "published";
  state.message = `GitHub 저장소에 올렸습니다. ${state.repoHtmlUrl}`;
  await writeState(state);
}

async function saveGhToken(token: string) {
  await new Promise<void>((resolve) => {
    const child = spawn("gh", [
      "auth",
      "login",
      "--hostname",
      "github.com",
      "--with-token",
      "--insecure-storage",
    ]);
    child.stdin?.on("error", () => undefined);
    child.stdin?.write(`${token}\n`);
    child.stdin?.end();
    const finish = () => resolve();
    child.on("close", finish);
    child.on("error", finish);
    setTimeout(finish, 15_000);
  });
}

async function pushToGitHub(token: string, login: string, repoName: string) {
  const remoteUrl = `https://github.com/${login}/${repoName}.git`;
  try {
    await execFileAsync("git", ["remote", "remove", "github"], { cwd: "/workspace" });
  } catch {
    // remote가 없으면 무시
  }
  await execFileAsync("git", ["remote", "add", "github", remoteUrl], { cwd: "/workspace" });
  await execFileAsync(
    "git",
    ["-c", `http.extraHeader=Authorization: Bearer ${token}`, "push", "-u", "github", "HEAD:main"],
    {
      cwd: "/workspace",
      timeout: 120_000,
    },
  );
}
