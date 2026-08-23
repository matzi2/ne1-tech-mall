import { company } from "@/lib/company";

export const GABIA_CHECKLIST_STORAGE = "ne1-gabia-dns-v014";

export const gabiaLinks = [
  { id: "login", label: "가비아 로그인", href: "https://accounts.gabia.com/" },
  { id: "home", label: "가비아 홈", href: "https://www.gabia.com/" },
  { id: "dns", label: "DNS 관리툴", href: "https://dns.gabia.com/" },
] as const;

export const gabiaConsole = {
  name: "가비아 DNS 관리툴",
  domain: company.apex,
  toolUrl: "https://dns.gabia.com/",
  loginUrl: "https://accounts.gabia.com/",
  homeUrl: "https://www.gabia.com/",
  notice:
    "가비아 공식 로그인은 /connect/gabia 작업창에서 직접 합니다. 이 페이지는 넣을 DNS 값과 공개 조회입니다.",
  steps: [
    "가비아 홈페이지에 로그인합니다. 아이디·비밀번호·보안 문자를 입력합니다.",
    "상단 [서비스 관리]를 엽니다.",
    "[DNS 관리툴]을 엽니다.",
    `${company.apex} 을 체크한 뒤 [DNS 설정]을 누릅니다.`,
    "하단 [+ 레코드 추가]로 아래 값을 넣고 [확인]한 다음, 반드시 상단 [저장]을 누릅니다.",
  ],
};

export type GabiaRecordAction = "keep" | "add" | "needs-ip";

export type GabiaRecord = {
  id: string;
  host: string;
  type: "A" | "CNAME" | "MX" | "TXT" | "NS";
  value: string;
  priority?: string;
  ttl: string;
  action: GabiaRecordAction;
  note: string;
};

export function gabiaRecords(ipv4 = ""): GabiaRecord[] {
  const ip = ipv4.trim();
  return [
    {
      id: "a-apex",
      host: "@",
      type: "A",
      value: ip,
      ttl: company.dns.ttl,
      action: ip ? "add" : "needs-ip",
      note: "원 도메인 접속용. 호스트 @, 값은 숫자 IP만 넣습니다.",
    },
    {
      id: "cname-www",
      host: "www",
      type: "CNAME",
      value: `${company.dns.wwwTarget}.`,
      ttl: company.dns.ttl,
      action: "keep",
      note: "공개 DNS에 이미 있습니다. 다시 넣지 마세요.",
    },
    {
      id: "mx-10",
      host: "@",
      type: "MX",
      value: "aspmx.daum.net.",
      priority: "10",
      ttl: company.dns.ttl,
      action: "keep",
      note: "이미 공개 DNS에 있습니다. 다시 넣지 마세요.",
    },
    {
      id: "mx-20",
      host: "@",
      type: "MX",
      value: "alt.aspmx.daum.net.",
      priority: "20",
      ttl: company.dns.ttl,
      action: "keep",
      note: "이미 공개 DNS에 있습니다. 다시 넣지 마세요.",
    },
    {
      id: "txt-spf",
      host: "@",
      type: "TXT",
      value: company.dns.spf,
      ttl: company.dns.ttl,
      action: "keep",
      note: "Daum SPF가 이미 있습니다. 덮어쓰지 마세요.",
    },
    {
      id: "txt-dmarc",
      host: "_dmarc",
      type: "TXT",
      value: "v=DMARC1; p=none;",
      ttl: company.dns.ttl,
      action: "add",
      note: "메일 정책. 호스트는 _dmarc, 값에 따옴표 없이 넣습니다.",
    },
    {
      id: "ns",
      host: "@",
      type: "NS",
      value: company.dns.nameservers,
      ttl: "등록기관",
      action: "keep",
      note: "가비아 네임서버입니다. 바꾸지 마세요.",
    },
  ];
}

export function gabiaCopyLine(record: GabiaRecord) {
  const parts = [`호스트 ${record.host}`, `타입 ${record.type}`, `값 ${record.value || "(IP 필요)"}`];
  if (record.priority) parts.push(`우선순위 ${record.priority}`);
  parts.push(`TTL ${record.ttl}`);
  return parts.join(" · ");
}
