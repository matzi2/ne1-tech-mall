import { company } from "@/lib/company";

export const DOMAIN_STORAGE = "ne1-dns-v013";

export type DnsRecord = {
  host: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
  value: string;
  ttl: string;
  note: string;
};

export type DnsSettings = {
  registrar: string;
  nameservers: string;
  ipv4: string;
  wwwTarget: string;
  mx: string;
  savedAt?: string;
};

export const defaultDnsSettings: DnsSettings = {
  registrar: company.dns.registrar,
  nameservers: company.dns.nameservers,
  ipv4: "",
  wwwTarget: company.dns.wwwTarget,
  mx: company.dns.mx,
};

export const domainPlan = {
  apex: company.apex,
  www: company.wwwHost,
  siteUrl: company.siteUrl,
  display: company.domain,
  emails: [company.email, company.supportEmail] as const,
};

export function plannedRecords(settings: DnsSettings): DnsRecord[] {
  const ipv4 = settings.ipv4.trim() || "(호스팅 IPv4를 넣으면 여기에 표시)";
  const www = settings.wwwTarget.trim() || company.dns.wwwTarget;
  const mx = settings.mx.trim() || company.dns.mx;
  const ns = settings.nameservers.trim() || company.dns.nameservers;

  return [
    {
      host: "@",
      type: "A",
      value: ipv4,
      ttl: company.dns.ttl,
      note: `루트 도메인 ${company.apex} → 쇼핑몰 서버`,
    },
    {
      host: "www",
      type: "CNAME",
      value: www,
      ttl: company.dns.ttl,
      note: `${company.wwwHost} 를 공식 주소로 연결`,
    },
    {
      host: "@",
      type: "AAAA",
      value: settings.ipv4 ? "(IPv6가 있으면 추가)" : "(선택)",
      ttl: company.dns.ttl,
      note: "IPv6를 쓰는 호스팅만 등록",
    },
    {
      host: "@",
      type: "MX",
      value: mx,
      ttl: company.dns.ttl,
      note: `${company.email} / ${company.supportEmail} 메일 수신`,
    },
    {
      host: "@",
      type: "TXT",
      value: company.dns.spf,
      ttl: company.dns.ttl,
      note: "메일 발신 확인. 호스팅사 SPF가 있으면 그 값으로 교체",
    },
    {
      host: "@",
      type: "NS",
      value: ns,
      ttl: "등록기관",
      note: "도메인 등록기관에 적힌 네임서버",
    },
  ];
}
