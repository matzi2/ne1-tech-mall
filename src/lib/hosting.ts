export type HostingState = {
  ipv4: string | null;
  tunnelUrl: string | null;
  message: string;
};

export const HOSTING_NOTE =
  "호스팅은 회사 공인 IP 아래 시놀로지 NAS입니다. 가비아 A(@)에는 공유기 WAN IPv4를 넣습니다. 이 작업 서버의 NAT 주소는 넣지 마세요.";
