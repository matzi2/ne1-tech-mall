import { gabiaApply } from "@/lib/gabia-connect";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { ipv4?: string };
  return Response.json(await gabiaApply({ ipv4: body.ipv4 }));
}
