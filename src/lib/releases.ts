export type Release = {
  version: string;
  date: string;
  title: string;
  items: string[];
};

export const releases: Release[] = [
  {
    version: "0.2.6",
    date: "2026-08-23",
    title: "스마트 검색",
    items: [
      "품번뿐 아니라 사양·문장으로 부품을 찾음",
      "검색창에 해석 결과를 바로 표시",
      "OPENAI_API_KEY가 있으면 긴 문장을 모델이 이어서 해석",
    ],
  },
  {
    version: "0.2.5",
    date: "2026-08-23",
    title: "BOM과 제품 표 보기",
    items: [
      "품번을 모아 BOM으로 수량·CSV·견적 처리",
      "제품몰에서 카드와 표 보기 전환",
      "견적·문의에 BOM을 붙여 마이페이지·운영화면에 저장",
    ],
  },
  {
    version: "0.2.4",
    date: "2026-08-23",
    title: "부품 구분과 스펙서치",
    items: [
      "대분류·중분류로 전자부품을 구성",
      "품번 검색 후 사양을 표로 비교",
    ],
  },
  {
    version: "0.2.3",
    date: "2026-08-23",
    title: "관리자 화면은 관리자 메일만",
    items: [
      "관리자 이메일로 로그인해야 운영화면이 보임",
      "다른 메일로는 쇼핑몰·마이페이지만",
    ],
  },
  {
    version: "0.2.2",
    date: "2026-08-23",
    title: "개발 작업실 분리",
    items: [
      "시놀로지·가비아 설정은 /connect 전용 화면",
      "쇼핑몰 화면에는 개발 메뉴를 붙이지 않음",
    ],
  },
  {
    version: "0.2.1",
    date: "2026-08-23",
    title: "시놀로지 NAS 호스팅",
    items: [
      "회사 공인 IP → 공유기 → 시놀로지 순서로 쇼핑몰 컨테이너 안내",
      "80·443 밖에서 확인, 가비아 A에는 공유기 WAN IP",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-08-23",
    title: "개발 작업창 정리",
    items: [
      "쇼핑몰 화면만 공개. 연결 작업실은 관리자만",
      "무료 전용 공인 IPv4는 클라우드 계정 필요",
    ],
  },
  {
    version: "0.1.9",
    date: "2026-08-23",
    title: "홈쇼핑 순서로 홈·제품몰 이어가기",
    items: [
      "오늘 추천, 품목, 베스트에서 담기·바로 주문",
      "제품몰 정렬과 같은 품목 추천",
      "www·_dmarc 반영. 다음은 호스팅 A 레코드",
    ],
  },
  {
    version: "0.1.8",
    date: "2026-08-23",
    title: "추가 DNS와 호스팅 IP 안내",
    items: [
      "가비아에 _dmarc TXT 추가",
      "고정 공인 IPv4는 호스팅 서버가 정해진 뒤 A 레코드로 등록",
    ],
  },
  {
    version: "0.1.7",
    date: "2026-08-23",
    title: "가비아 공식 로그인 작업창",
    items: [
      "작업창에 가비아 로그인 화면을 그대로 표시",
      "로그인 후 DNS 관리툴에서 www CNAME 등록",
    ],
  },
  {
    version: "0.1.6",
    date: "2026-08-23",
    title: "가비아 인증번호 확인 후 DNS 이어가기",
    items: [
      "해외 IP 인증번호 확인 토큰을 올바르게 저장",
      "인증 성공 뒤 보안 문자 없이 로그인·www CNAME 등록",
      "인증 결과를 작업창에 바로 표시",
    ],
  },
  {
    version: "0.1.5",
    date: "2026-08-23",
    title: "가비아 로그인 후 DNS 등록",
    items: [
      "작업창에서 가비아 아이디·보안 문자 로그인",
      "로그인되면 www CNAME을 가비아 DNS에 등록",
    ],
  },
  {
    version: "0.1.4",
    date: "2026-08-23",
    title: "가비아 DNS 설정 작업",
    items: [
      "가비아 DNS 관리툴 순서에 맞춰 레코드 추가 작업창",
      "www CNAME(ne1-tech.co.kr.) 추가, MX/SPF/NS는 유지",
      "A 레코드는 호스팅 IP가 정해진 뒤 입력",
    ],
  },
  {
    version: "0.1.3",
    date: "2026-08-23",
    title: "도메인과 DNS 정보",
    items: [
      "공식 도메인 NE1-TECH.CO.KR 과 등록용 DNS 레코드",
      "가비아 네임서버와 Daum 메일(MX/SPF) 반영",
      "회사소개·운영화면에 도메인/DNS 상태 표시",
      "작업창에서 등록기관·네임서버·A/CNAME/MX 저장과 실시간 조회",
    ],
  },
  {
    version: "0.1.2",
    date: "2026-08-23",
    title: "GitHub 연결과 관리자 운영화면",
    items: [
      "GitHub 저장소 matzi2/ne1-tech-mall 연결",
      "이메일 1회용 비밀번호 로그인, 세션 유지",
      "관리자 matzi57@gmail.com 운영화면 상시 표시",
    ],
  },
  {
    version: "0.1.1",
    date: "2026-08-22",
    title: "사이트 연결 작업실",
    items: [
      "GitHub·카카오·카드·송금 작업창",
      "엔원테크 CI 색 적용",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-08-22",
    title: "쇼핑몰 첫 공개",
    items: [
      "제품몰, 장바구니, 주문, 포인트",
      "회사소개와 상품 등록",
    ],
  },
];
