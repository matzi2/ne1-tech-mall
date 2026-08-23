import { gabiaInit } from "@/lib/gabia-connect";

export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json(await gabiaInit());
}
