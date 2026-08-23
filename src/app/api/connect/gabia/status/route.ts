import { gabiaStatus } from "@/lib/gabia-connect";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await gabiaStatus());
}
