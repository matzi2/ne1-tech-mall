export type Release = {
  version: string;
  date: string;
  title: string;
  items: string[];
};

export const releases: Release[] = [
  {
    version: "0.1.3",
    date: "2026-08-23",
    title: "도메인과 DNS 정보",
    items: [
      "공식 도메인 NE1-TECH.CO.KR 과 등록용 DNS 레코드",
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
