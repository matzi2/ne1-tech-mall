export type Role = "admin" | "business" | "member";

export const ADMIN_EMAIL = "matzi57@gmail.com";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined) {
  return normalizeEmail(email ?? "") === ADMIN_EMAIL;
}

export function isAdmin(user: { email: string } | null | undefined) {
  return Boolean(user && isAdminEmail(user.email));
}

export const company = {
  nameKo: "엔이원텍",
  nameEn: "NE1-TECH",
  legalName: "주식회사 엔이원텍",
  version: "0.2.12",
  releasedAt: "2026-08-23",
  domain: "NE1-TECH.CO.KR",
  siteUrl: "https://ne1-tech.co.kr",
  apex: "ne1-tech.co.kr",
  wwwHost: "www.ne1-tech.co.kr",
  dns: {
    ttl: "3600",
    registrar: "가비아",
    nameservers: "ns.gabia.co.kr, ns1.gabia.co.kr, ns.gabia.net",
    wwwTarget: "ne1-tech.co.kr",
    mx: "10 aspmx.daum.net, 20 alt.aspmx.daum.net",
    spf: "v=spf1 include:_spf.daum.net ~all",
    note: "공식 주소는 ne1-tech.co.kr 입니다. 메일은 sales@ / support@ 로 받습니다.",
  },
  tagline: "전자부품, 품번으로 찾고 사양으로 비교합니다.",
  description:
    "엔이원텍(NE1-TECH)은 반도체, 센서, 수동소자, 전원, 커넥터, 스위치/전기부품, 제어기기 등 전자부품을 취급합니다. 재고·주문 납품을 대응합니다.",
  founded: "2020.09.16",
  ceo: "김태극",
  industry: "전자부품 유통·공급",
  business: "반도체 · 센서 · 수동소자 · 전원/파워 · 커넥터/단자 · 스위치/전기부품 · 제어/모터",
  address:
    "인천광역시 서구 파랑로 495, 2동 910호 (청라동, 에이스하이테크시티청라)",
  postalCode: "22770",
  hours: "평일 09:00–18:00 (주말·공휴일 휴무)",
  email: "sales@ne1-tech.co.kr",
  supportEmail: "support@ne1-tech.co.kr",
  phone: "032-220-0823",
  phone2: "032-220-0824",
  fax: "032-220-0926",
  bank: {
    name: "기업은행",
    account: "123-086154-01-014",
    holder: "주식회사 엔이원텍",
  },
  points: {
    rateLabel: "결제금액 1% 적립",
    wonPerPoint: 100,
    description: "회원 구매 시 실결제 100원당 1포인트가 적립됩니다. 1포인트는 1원으로 다음 주문에 쓸 수 있습니다.",
  },
} as const;

export const companyHistory = [
  {
    year: "2020",
    title: "주식회사 엔이원텍 설립",
    body: "산업용 전자부품 공급 법인으로 출발했습니다.",
  },
  {
    year: "2022",
    title: "차단기·전원장치 카탈로그 확대",
    body: "배선용차단기, 누전차단기, SMPS, 단자대 등 유지보수 품목을 정비했습니다.",
  },
  {
    year: "2024",
    title: "에이스하이테크시티 거점 운영",
    body: "수도권 재고 대응과 소량 주문 납기를 맞출 수 있게 거점을 운영합니다.",
  },
  {
    year: "2026",
    title: "NE1-TECH.CO.KR 쇼핑몰 v0.1.0 오픈",
    body: "전자부품을 품목별로 검색·주문할 수 있게 했습니다.",
  },
] as const;

export const capabilities = [
  {
    title: "반도체 · 센서 · 수동소자",
    body: "IC, 트랜지스터, 온습도센서, 저항·콘덴서 등 기판용 소자를 품번으로 찾습니다.",
  },
  {
    title: "전원 · 커넥터 · 표시",
    body: "SMPS, 배터리 홀더, 커넥터, PCB, LED/LCD를 시제품과 함체 작업에 맞춰 냅니다.",
  },
  {
    title: "스위치 · 전기부품",
    body: "택트스위치부터 MCCB, ELCB, 퓨즈, SPD까지 보호·개폐 부품을 같이 취급합니다.",
  },
  {
    title: "제어 · 공구 · 계측",
    body: "접촉기, 릴레이, 모터와 납땜·멀티미터 등 현장 공구를 함께 공급합니다.",
  },
] as const;

export const demoAccounts: {
  type: string;
  email: string;
  name: string;
  role: Role;
}[] = [
  {
    type: "관리자",
    email: "matzi57@gmail.com",
    name: "정범",
    role: "admin",
  },
  {
    type: "사업자 회원",
    email: "biz@ne1-tech.co.kr",
    name: "사업자 담당자",
    role: "business",
  },
  {
    type: "개인 회원",
    email: "member@ne1-tech.co.kr",
    name: "김현장",
    role: "member",
  },
];
