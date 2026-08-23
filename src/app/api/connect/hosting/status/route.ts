import { readFile } from "node:fs/promises";
import path from "node:path";
import { HOSTING_NOTE, type HostingState } from "@/lib/hosting";

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
    ipv4: extra.ipv4 ?? null,
    tunnelUrl: extra.tunnelUrl ?? null,
    message: extra.message || HOSTING_NOTE,
  } satisfies HostingState);
}
