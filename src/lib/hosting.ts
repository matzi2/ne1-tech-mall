export type HostingState = {
  ipv4: string | null;
  tunnelUrl: string | null;
  message: string;
};

/** matzi57.synology.me 가 가리키는 공유기 WAN. 가비아 A(@)에 넣을 값. 이 작업 서버 NAT가 아닙니다. */
export const HOSTING_WAN_IPV4 = "175.123.135.188";

export const HOSTING_NOTE =
  "호스팅은 회사 공인 IP 아래 시놀로지 NAS입니다. 가비아 A(@)에는 공유기 WAN IPv4를 넣습니다. 이 작업 서버의 NAT 주소는 넣지 마세요.";
