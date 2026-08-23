import { company } from "@/lib/company";

export const NAS_STORAGE = "ne1-synology-v021";
export const NAS_APP_PORT = 43177;
export const NAS_GITHUB_URL = "https://github.com/matzi2/ne1-tech-mall.git";
export const NAS_DEFAULT_PATH = "/volume1/docker/ne1-tech-mall";

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
    body: "외부 TCP 80 → NAS 내부 IP:80, 외부 TCP 443 → NAS 내부 IP:443. DSM(5000·5001), SSH(22), 파일공유(139·445)는 열지 않습니다.",
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
    body: `가비아 DNS에서 호스트 @, 타입 A, 값에 회사 공인 IPv4를 넣습니다. 메일은 Daum MX 그대로 둡니다.`,
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
