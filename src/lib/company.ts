export type Role = "admin" | "business" | "member";

export const ADMIN_EMAIL = "matzi57@gmail.com";

export function isAdmin(user: { email: string; role: Role } | null | undefined) {
  if (!user) return false;
  return user.role === "admin" || user.email === ADMIN_EMAIL;
}

export const company = {
  nameKo: "엔이원텍",
  nameEn: "NE1-TECH",
  legalName: "주식회사 엔이원텍",
  version: "0.1.6",
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
    note: "도메인은 가비아에 등록되어 있습니다. 메일은 Daum(aspmx.daum.net)으로 받습니다. 가비아 DNS 관리툴에서 www CNAME(ne1-tech.co.kr.)을 넣고, 호스팅 IPv4가 정해지면 A(@)를 추가합니다.",
  },
  tagline: "산업용 전자부품, 품목별로 바로 찾습니다.",
  description:
    "엔이원텍(NE1-TECH)은 배선용차단기, 누전차단기, 전자접촉기, 전원장치, 단자대, 서지보호기 등 현장 유지보수용 전자부품을 공급합니다. 인천 청라에서 재고·주문 납품을 대응합니다.",
  founded: "2020.09.16",
  ceo: "김태극",
  industry: "산업용 전자부품 유통·공급",
  business: "배선용차단기 · 누전차단기 · 전자접촉기 · 전원장치 · 단자대 · 서지보호기",
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
    body: "인천 청라에서 산업용 전자부품 공급 법인으로 출발했습니다.",
  },
  {
    year: "2022",
    title: "차단기·전원장치 카탈로그 확대",
    body: "배선용차단기, 누전차단기, SMPS, 단자대 등 유지보수 품목을 정비했습니다.",
  },
  {
    year: "2024",
    title: "청라 에이스하이테크시티 거점 운영",
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
    title: "배선용·누전차단기",
    body: "MCCB, ELCB 등 인입·분기 보호 소자를 정격별로 공급합니다.",
  },
  {
    title: "전자접촉기·릴레이",
    body: "모터 기동용 접촉기와 제어 신호용 보조릴레이를 재고로 대응합니다.",
  },
  {
    title: "전원·서지 보호",
    body: "DIN 레일 SMPS와 24V SPD로 제어전원과 신호선을 안정적으로 구성합니다.",
  },
  {
    title: "단자·퓨즈",
    body: "제어배선 단자대와 퓨즈홀더 등 함체 내부 소모품을 소량부터 납품합니다.",
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
    name: "청라전기 담당자",
    role: "business",
  },
  {
    type: "개인 회원",
    email: "member@ne1-tech.co.kr",
    name: "김현장",
    role: "member",
  },
];
