import { readFile } from "node:fs/promises";
import path from "node:path";
import { HOSTING_NOTE, HOSTING_WAN_IPV4, type HostingState } from "@/lib/hosting";

export const dynamic = "force-dynamic";

const STATE_PATH = path.join("/tmp", "ne1-hosting.json");

export async function GET() {
  let extra: Partial<HostingState> = {};
  try {
    extra = JSON.parse(await readFile(STATE_PATH, "utf8")) as Partial<HostingState>;
  } catch {
    extra = {};
  }
  return Response.json({
    ipv4: HOSTING_WAN_IPV4,
    tunnelUrl: extra.tunnelUrl ?? null,
    message: `${HOSTING_NOTE} 가비아 A(@) 값은 ${HOSTING_WAN_IPV4} (matzi57.synology.me) 입니다. 터널 주소는 A에 넣지 마세요.`,
  } satisfies HostingState);
}
