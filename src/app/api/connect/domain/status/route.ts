import { Resolver } from "node:dns/promises";
import { domainPlan } from "@/lib/dns";

export const dynamic = "force-dynamic";

async function resolveSafe(kind: "A" | "CNAME" | "NS" | "MX" | "TXT", hostname: string) {
  const resolver = new Resolver();
  resolver.setServers(["1.1.1.1", "8.8.8.8"]);
  try {
    if (kind === "A") return { kind, hostname, values: await resolver.resolve4(hostname) };
    if (kind === "CNAME") return { kind, hostname, values: await resolver.resolveCname(hostname) };
    if (kind === "NS") return { kind, hostname, values: await resolver.resolveNs(hostname) };
    if (kind === "MX") {
      const rows = await resolver.resolveMx(hostname);
      return { kind, hostname, values: rows.map((row) => `${row.priority} ${row.exchange}`) };
    }
    const txt = await resolver.resolveTxt(hostname);
    return { kind, hostname, values: txt.map((row) => row.join("")) };
  } catch (error) {
    return {
      kind,
      hostname,
      values: [] as string[],
      error: error instanceof Error ? error.message : "조회 실패",
    };
  }
}

export async function GET() {
  const apex = domainPlan.apex;
  const www = domainPlan.www;
  const [a, ns, mx, txt, cname] = await Promise.all([
    resolveSafe("A", apex),
    resolveSafe("NS", apex),
    resolveSafe("MX", apex),
    resolveSafe("TXT", apex),
    resolveSafe("CNAME", www),
  ]);

  const live = a.values.length > 0;
  const wwwLive = cname.values.length > 0;
  return Response.json({
    apex,
    www,
    siteUrl: domainPlan.siteUrl,
    live,
    wwwLive,
    message: live
      ? "DNS A 기록이 있습니다. 사이트 응답은 호스팅·SSL 상태에 따라 다릅니다."
      : wwwLive
        ? `www CNAME(${cname.values.join(", ")}) 이 반영됐습니다. 사이트 접속용 A 레코드는 호스팅 IP가 정해진 뒤 넣습니다.`
        : "아직 A 기록이 없습니다. 아래 표의 IPv4와 네임서버를 등록해야 합니다.",
    lookups: [a, cname, ns, mx, txt],
  });
}
