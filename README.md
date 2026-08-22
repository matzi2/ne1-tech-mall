# 엔이원텍 쇼핑몰 (NE1-TECH)

주식회사 엔이원텍 공식 쇼핑몰 **v0.1.1**. 도메인: [NE1-TECH.CO.KR](https://ne1-tech.co.kr)

산업용 전자부품을 품목별로 검색하고, 무통장 송금 또는 카드로 주문할 수 있습니다. 회원 구매 시 실결제 100원당 1포인트가 적립됩니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:43177` 로 접속합니다. 사이트 연결 작업실은 `/connect` 입니다.

## 사이트 연결

`/connect` 에서 GitHub, 카카오 로그인, 카카오 디벨로퍼스, 카드 결제, 기업은행 송금, CI, 도메인을 **작업 창**으로 열고 직접 로그인·설정합니다.

- GitHub: 장치 코드 → `github.com/login/device` 창에서 승인 → `ne1-tech-mall` 저장소 생성·푸시
- 카카오: MATCHDOC과 같은 `/oauth2/authorization/kakao` → `/redirect?accesstoken=` → `localStorage.accessToken`

카카오 REST 키와 카드사 PG 키가 없으면 작업용 화면으로 진행합니다. 키를 넣으면 실제 카카오 로그인으로 넘어갑니다.

## 테스트 계정

| 구분 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 관리자 | admin@ne1-tech.co.kr | demo1234 |
| 사업자 | biz@ne1-tech.co.kr | demo1234 |
| 개인 | member@ne1-tech.co.kr | demo1234 |

관리자로 로그인하면 `/admin/products/new` 에서 CSV/JSON 파일, 제품 사진, 기술 문서로 상품을 등록할 수 있습니다.

## 범위

- 상품 검색 (헤더, 홈, 제품몰, 자동완성)
- 장바구니 · 주문
- 무통장 송금 / 신용·체크카드 결제 (카드는 테스트 입력, 뒷 4자리만 저장)
- 구매 포인트 적립·사용
- 파일·사진·문서로 상품 등록
- 로그인 / 회원가입 / 찾기 화면, 카카오 로그인 작업 창
- 사이트 연결 작업실

데이터는 브라우저 `localStorage`에 저장됩니다.
