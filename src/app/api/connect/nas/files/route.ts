import { listNasFiles } from "@/lib/nas-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") || "/webdav/";
  return Response.json(await listNasFiles(path));
}
