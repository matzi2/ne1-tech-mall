import { company } from "@/lib/company";

export const NAS_STORAGE = "ne1-synology-v021";
export const NAS_APP_PORT = 43177;
export const NAS_GITHUB_URL = "https://github.com/matzi2/ne1-tech-mall.git";
export const NAS_DEFAULT_PATH = "/volume1/docker/ne1-tech-mall";
export const NAS_QUICKCONNECT_ID = "matzi57";
export const NAS_QUICKCONNECT_URL = "http://QuickConnect.to/matzi57";
export const NAS_DSM_HTTPS_PORT = 61199;
export const NAS_DEFAULT_ADDRESS = NAS_QUICKCONNECT_URL;
export const NAS_DEFAULT_USERNAME = "matzi2";

export type NasSessionPublic = {
  connected: boolean;
  host: string;
  port: number;
  protocol: "https" | "http";
  username: string;
  sid?: string;
  via?: "dsm" | "webdav";
  needOtp?: boolean;
  connectedAt?: string;
  lastMessage: string;
};

export type NasFileEntry = {
  name: string;
  href: string;
  collection: boolean;
};

export function parseNasHost(raw: string): {
  host: string;
  port: number;
  protocol: "https" | "http";
  quickConnectId?: string;
} | null {
  const value = raw.trim();
  if (!value) return null;
  const qcPath = value.match(/(?:https?:\/\/)?(?:www\.)?quickconnect\.to\/([a-z0-9-]+)/i);
  if (qcPath) {
    const id = qcPath[1].toLowerCase();
    return { host: `${id}.synology.me`, port: NAS_DSM_HTTPS_PORT, protocol: "https", quickConnectId: id };
  }
  if (/^[a-z0-9][a-z0-9-]{1,30}$/i.test(value)) {
    const id = value.toLowerCase();
    return { host: `${id}.synology.me`, port: NAS_DSM_HTTPS_PORT, protocol: "https", quickConnectId: id };
  }
  try {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withScheme);
    if (url.username || url.password) return null;
    const host = url.hostname.replace(/\.$/, "");
    if (!host || host.includes(" ")) return null;
    const qcHost = host.match(/^([a-z0-9-]+)\.quickconnect\.to$/i);
    if (qcHost && !host.toLowerCase().includes(".direct.")) {
      const id = qcHost[1].toLowerCase();
      return { host: `${id}.synology.me`, port: NAS_DSM_HTTPS_PORT, protocol: "https", quickConnectId: id };
    }
    const synoMe = host.match(/^([a-z0-9-]+)\.(?:synology|diskstation)\.me$/i);
    if (synoMe) {
      const id = synoMe[1].toLowerCase();
      const port = url.port ? Number(url.port) : NAS_DSM_HTTPS_PORT;
      if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
      return { host: `${id}.synology.me`, port, protocol: url.protocol === "http:" ? "http" : "https", quickConnectId: id };
    }
    const isQuick = host.endsWith(".quickconnect.to") || host.endsWith(".synology.me") || host.endsWith(".diskstation.me");
    const protocol = url.protocol === "http:" ? "http" : "https";
    const port = url.port
      ? Number(url.port)
      : isQuick
        ? protocol === "http"
          ? 80
          : 443
        : protocol === "http"
          ? 5000
          : 5001;
    if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
    return { host, port, protocol };
  } catch {
    return null;
  }
}

export function dsmHref(raw: string) {
  const parsed = parseNasHost(raw);
  if (!parsed) return NAS_QUICKCONNECT_URL;
  if (parsed.quickConnectId) return `http://QuickConnect.to/${parsed.quickConnectId}`;
  return `${parsed.protocol}://${parsed.host}:${parsed.port}/`;
}

export type NasSettings = {
  publicIpv4: string;
  lanIpv4: string;
  sharePath: string;
  savedAt?: string;
};

export const defaultNasSettings: NasSettings = {
  publicIpv4: "",
  lanIpv4: "192.168.0.100",
  sharePath: NAS_DEFAULT_PATH,
};

export function isIpv4(value: string) {
  const parts = value.trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

export function ipv4Kind(value: string): "public" | "private" | "cgnat" | "invalid" {
  if (!isIpv4(value)) return "invalid";
  const [a, b] = value.trim().split(".").map(Number);
  if (a === 10 || a === 127 || a === 0) return "private";
  if (a === 192 && b === 168) return "private";
  if (a === 172 && b >= 16 && b <= 31) return "private";
  if (a === 169 && b === 254) return "private";
  if (a === 100 && b >= 64 && b <= 127) return "cgnat";
  return "public";
}

export const nasLinks = [
  { id: "dsm", label: "시놀로지 DSM 도움말 · 역방향 프록시", href: "https://kb.synology.com/ko-kr/DSM/help/DSM/AdminCenter/application_reverseproxy" },
  { id: "cert", label: "시놀로지 · Let's Encrypt 인증서", href: "https://kb.synology.com/ko-kr/DSM/help/DSM/AdminCenter/connection_certificate" },
  { id: "github", label: "쇼핑몰 소스 (GitHub)", href: "https://github.com/matzi2/ne1-tech-mall" },
  { id: "gabia-dns", label: "가비아 DNS 관리툴", href: "https://dns.gabia.com/" },
] as const;

export const nasSteps = [
  {
    id: "ip",
    title: "공인 IP 확인",
    body: "회사 회선이 붙은 공유기 상태 화면에서 WAN IPv4를 확인합니다. 192.168·10·172.16–31로 시작하면 사설 IP라 가비아 A에 넣으면 안 됩니다.",
  },
  {
    id: "forward",
    title: "공유기 포트포워드",
    body: "외부 TCP 80 → NAS 내부 IP:80, 외부 TCP 443 → NAS 내부 IP:443. DSM은 QuickConnect(http://QuickConnect.to/matzi57)로 들어갑니다. 5000·5001과 SSH(22)는 인터넷에 상시로 열지 않습니다.",
  },
  {
    id: "package",
    title: "컨테이너 관리자 설치",
    body: "DSM 패키지 센터에서 Container Manager(구 Docker)를 설치합니다. Web Station은 PHP용이라 이 쇼핑몰에는 쓰지 않습니다.",
  },
  {
    id: "source",
    title: "소스 넣기",
    body: `File Station에서 ${NAS_DEFAULT_PATH} 폴더를 만들고, GitHub 소스를 올리거나 SSH에서 git clone 합니다.`,
  },
  {
    id: "compose",
    title: "컨테이너 실행",
    body: "컨테이너 관리자 → 프로젝트 → 생성. 경로를 소스 폴더로 두고 docker-compose.yml을 사용합니다. 웹 포트는 내부 43177만 엽니다.",
  },
  {
    id: "proxy",
    title: "역방향 프록시",
    body: "제어판 → 로그인 포털 → 고급 → 역방향 프록시. 소스 HTTPS 443 / 호스트 ne1-tech.co.kr, 대상 HTTP 127.0.0.1:43177. www도 같은 대상으로 하나 더 만듭니다.",
  },
  {
    id: "ssl",
    title: "인증서",
    body: "제어판 → 보안 → 인증서 → 추가 → Let's Encrypt. 도메인 ne1-tech.co.kr, 주제 대체 이름 www.ne1-tech.co.kr. 80번이 열려 있어야 발급됩니다.",
  },
  {
    id: "gabia",
    title: "가비아 A 레코드",
    body: `가비아에 호스트 @ · A · 175.123.135.188 이 등록됐습니다. 메일은 Daum MX 그대로 둡니다.`,
  },
] as const;

export function nasReverseProxyRows(lanIpv4: string) {
  const dest = `${lanIpv4.trim() || "127.0.0.1"}:${NAS_APP_PORT}`;
  return [
    {
      id: "https-apex",
      source: `HTTPS · ${company.apex} · 443`,
      dest: `HTTP · ${dest}`,
      note: "공식 주소",
    },
    {
      id: "https-www",
      source: `HTTPS · ${company.wwwHost} · 443`,
      dest: `HTTP · ${dest}`,
      note: "www",
    },
    {
      id: "http-apex",
      source: `HTTP · ${company.apex} · 80`,
      dest: `HTTPS · ${company.apex} · 443`,
      note: "DSM에서 HSTS/자동 리다이렉트를 켜면 생략 가능",
    },
  ];
}

export function nasRouterForwards(lanIpv4: string) {
  const lan = lanIpv4.trim() || "NAS내부IP";
  return [
    { proto: "TCP", wan: "80", lan: `${lan}:80`, why: "Let's Encrypt 발급 + HTTP" },
    { proto: "TCP", wan: "443", lan: `${lan}:443`, why: "쇼핑몰 HTTPS" },
  ];
}

export function nasCloneCommand(sharePath: string) {
  const path = sharePath.trim() || NAS_DEFAULT_PATH;
  return `sudo mkdir -p ${path} && sudo git clone ${NAS_GITHUB_URL} ${path}`;
}

export function nasComposeUpCommand(sharePath: string) {
  const path = sharePath.trim() || NAS_DEFAULT_PATH;
  return `cd ${path} && sudo docker compose up -d --build`;
}

export function gabiaACopyLine(publicIpv4: string) {
  const ip = publicIpv4.trim() || "(회사 공인 IPv4)";
  return `호스트 @ · 타입 A · 값 ${ip} · TTL 3600`;
}
