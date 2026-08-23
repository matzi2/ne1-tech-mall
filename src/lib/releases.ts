export type Release = {
  version: string;
  date: string;
  title: string;
  items: string[];
};

export const releases: Release[] = [
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
