export const company = {
  nameKo: "엔이원텍",
  nameEn: "NE1-TECH",
  legalName: "주식회사 엔이원텍",
  version: "0.1.0",
  domain: "NE1-TECH.CO.KR",
  siteUrl: "https://ne1-tech.co.kr",
  tagline: "현장 맞춤 배전반과 자동제어반, 한 곳에서.",
  description:
    "엔이원텍(NE1-TECH)은 배전반·전기 자동제어반 제조를 중심으로 전자식 스위치와 산업용 전자부품을 공급합니다. 인천 청라에서 설계·조립·납품까지 한 흐름으로 대응합니다.",
  founded: "2020.09.16",
  ceo: "김태극",
  industry: "배전반 및 전기 자동제어반 제조업",
  business: "전자부품 · 전자식 스위치 · 수배전반 · 자동제어반",
  address:
    "인천광역시 서구 파랑로 495, 2동 910호 (청라동, 에이스하이테크시티청라)",
  postalCode: "22770",
  hours: "평일 09:00–18:00 (주말·공휴일 휴무)",
  email: "sales@ne1-tech.co.kr",
  supportEmail: "support@ne1-tech.co.kr",
  phone: "032-710-0910",
  fax: "032-710-0911",
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
    body: "인천 청라에서 배전반·전기 자동제어반 제조 법인으로 출발했습니다.",
  },
  {
    year: "2022",
    title: "전자식 스위치·부품 공급 확대",
    body: "현장 유지보수용 전자식 스위치, 차단기, 전원장치 카탈로그를 정비했습니다.",
  },
  {
    year: "2024",
    title: "청라 에이스하이테크시티 거점 운영",
    body: "설계 협의부터 소량 맞춤 제어반 제작까지 수도권 납기 대응 체계를 갖췄습니다.",
  },
  {
    year: "2026",
    title: "NE1-TECH.CO.KR 쇼핑몰 v0.1.0 오픈",
    body: "표준 제품 온라인 주문과 맞춤 제어반 견적 요청을 ne1-tech.co.kr에서 처리할 수 있게 했습니다.",
  },
] as const;

export const capabilities = [
  {
    title: "수배전반",
    body: "분전반, MCC, 조명반 등 현장 용량·회로 수에 맞춘 수배전 설비를 제작합니다.",
  },
  {
    title: "자동제어반",
    body: "PLC·인버터·ATS 제어반을 공정 조건에 맞춰 설계하고 시운전 지원까지 이어갑니다.",
  },
  {
    title: "전자식 스위치",
    body: "모터 보호, 타이머, 과부하, SSR 등 제어반에 바로 들어가는 전자식 스위치를 공급합니다.",
  },
  {
    title: "산업용 전자부품",
    body: "차단기, 전자접촉기, SMPS, 단자대, 서지보호기 등 유지보수 부품을 재고·주문으로 대응합니다.",
  },
] as const;

export const demoAccounts = [
  {
    type: "관리자",
    email: "admin@ne1-tech.co.kr",
    password: "demo1234",
    name: "엔이원텍 관리자",
    role: "admin" as const,
  },
  {
    type: "사업자 회원",
    email: "biz@ne1-tech.co.kr",
    password: "demo1234",
    name: "청라전기 담당자",
    role: "business" as const,
  },
  {
    type: "개인 회원",
    email: "member@ne1-tech.co.kr",
    password: "demo1234",
    name: "김현장",
    role: "member" as const,
  },
] as const;
