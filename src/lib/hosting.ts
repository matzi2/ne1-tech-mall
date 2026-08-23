export type HostingState = {
  ipv4: string | null;
  tunnelUrl: string | null;
  message: string;
};

export const HOSTING_NOTE =
  "이 작업 서버는 나가는 주소만 여러 개라 도메인에 넣을 고정 공인 IPv4를 만들 수 없습니다. A 레코드는 가비아 웹호스팅이나 클라우드 서버 IP가 정해진 뒤 넣습니다.";
