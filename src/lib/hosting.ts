export type HostingState = {
  ipv4: string | null;
  tunnelUrl: string | null;
  message: string;
};

export const HOSTING_NOTE =
  "무료 전용 공인 IPv4는 클라우드 계정(예: Oracle Cloud Always Free)이 있어야 발급됩니다. 이 작업 서버의 나가는 주소는 NAT라 A 레코드에 넣으면 사이트가 열리지 않습니다.";
