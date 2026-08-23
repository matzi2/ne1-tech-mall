export type ConnectionId =
  | "github"
  | "kakao"
  | "kakao-developers"
  | "card"
  | "bank"
  | "ci"
  | "domain"
  | "nas"
  | "origin";

export type SiteConnection = {
  id: ConnectionId;
  name: string;
  site: string;
  purpose: string;
  href: string;
  externalUrl?: string;
  windowName: string;
  width: number;
  height: number;
  required: boolean;
  actionLabel: string;
};

export const siteConnections: SiteConnection[] = [
  {
    id: "github",
    name: "GitHub",
    site: "github.com",
    purpose: "쇼핑몰 소스를 GitHub 저장소로 옮기고 커밋 히스토리를 유지합니다.",
    href: "/connect/github",
    externalUrl: "https://github.com/login/device",
    windowName: "ne1-github",
    width: 640,
    height: 820,
    required: true,
    actionLabel: "GitHub 연결",
  },
  {
    id: "kakao",
    name: "카카오 로그인",
    site: "kauth.kakao.com",
    purpose: "MATCHDOC과 같은 OAuth2 흐름으로 카카오 계정 로그인을 붙입니다.",
    href: "/oauth2/authorization/kakao",
    windowName: "ne1-kakao",
    width: 480,
    height: 740,
    required: true,
    actionLabel: "카카오 로그인",
  },
  {
    id: "kakao-developers",
    name: "카카오 디벨로퍼스",
    site: "developers.kakao.com",
    purpose: "REST API 키·Redirect URI를 등록하면 실제 카카오 검수 로그인을 켭니다.",
    href: "/connect/kakao-developers",
    externalUrl: "https://developers.kakao.com/console/app",
    windowName: "ne1-kakao-dev",
    width: 720,
    height: 820,
    required: false,
    actionLabel: "디벨로퍼스에서 작업",
  },
  {
    id: "card",
    name: "신용·체크카드",
    site: "결제 테스트 창",
    purpose: "카드사 PG 연동 전, 주문에 쓰는 카드 결제 화면을 직접 입력·확인합니다.",
    href: "/connect/card",
    windowName: "ne1-card",
    width: 520,
    height: 760,
    required: true,
    actionLabel: "카드 결제",
  },
  {
    id: "bank",
    name: "기업은행 송금",
    site: "ibk.co.kr",
    purpose: "무통장 입금 계좌를 확인하고 송금 안내 화면에서 입금자명을 맞춥니다.",
    href: "/connect/bank",
    windowName: "ne1-bank",
    width: 520,
    height: 700,
    required: true,
    actionLabel: "송금 안내",
  },
  {
    id: "ci",
    name: "엔원테크 CI",
    site: "n-onetech.com",
    purpose: "홈페이지와 같은 남색·파랑·빨강 CI를 쇼핑몰에 맞춰 확인합니다.",
    href: "/connect/ci",
    externalUrl: "https://n-onetech.com/",
    windowName: "ne1-ci",
    width: 960,
    height: 800,
    required: false,
    actionLabel: "CI 비교",
  },
  {
    id: "domain",
    name: "NE1-TECH.CO.KR",
    site: "ne1-tech.co.kr",
    purpose: "가비아 DNS 관리툴에 넣을 www CNAME과 A 레코드를 준비하고, 이미 있는 MX/SPF/NS는 유지합니다.",
    href: "/connect/gabia",
    windowName: "ne1-domain",
    width: 640,
    height: 720,
    required: false,
    actionLabel: "가비아 DNS",
  },
  {
    id: "nas",
    name: "시놀로지 NAS",
    site: "DSM · 공유기",
    purpose: "회사 공인 IP 아래 공유기에 붙은 시놀로지에 쇼핑몰 컨테이너를 올리고, 80·443만 밖으로 엽니다.",
    href: "/connect/nas",
    externalUrl: "https://kb.synology.com/ko-kr/DSM/help/DSM/AdminCenter/application_reverseproxy",
    windowName: "ne1-nas",
    width: 720,
    height: 860,
    required: true,
    actionLabel: "시놀로지 설정",
  },
  {
    id: "origin",
    name: "Cursor Origin",
    site: "origin.cursor.com",
    purpose: "현재 클라우드 작업 원격 저장소입니다. GitHub 연결 후에도 그대로 유지합니다.",
    href: "/connect/origin",
    windowName: "ne1-origin",
    width: 640,
    height: 640,
    required: false,
    actionLabel: "Origin 상태",
  },
];

export const KAKAO_KEYS_STORAGE = "ne1-kakao-keys-v011";
export const CONNECTIONS_STORAGE = "ne1-connections-v011";
export const ACCESS_TOKEN_KEY = "accessToken";

export type KakaoKeys = {
  restApiKey: string;
  javascriptKey: string;
  redirectUri: string;
};

export type LocalConnectionState = {
  kakao?: { connected: boolean; nickname: string; at: string };
  kakaoDevelopers?: { saved: boolean; at: string };
  card?: { tested: boolean; last4: string; at: string };
  bank?: { confirmed: boolean; depositor: string; at: string };
  ci?: { reviewed: boolean; at: string };
  domain?: { reviewed: boolean; at: string };
  nas?: { reviewed: boolean; at: string };
};
