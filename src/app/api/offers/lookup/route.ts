import { NextResponse } from "next/server";
import { lookupOffers } from "@/lib/offer-lookup";
import type { OfferLookupItem } from "@/lib/site-offers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    items?: OfferLookupItem[];
    refresh?: boolean;
  };
  const items = Array.isArray(body.items) ? body.items.slice(0, 4) : [];
  if (!items.length) {
    return NextResponse.json({ ok: false, message: "조회할 부품이 없습니다." }, { status: 400 });
  }

  const results = await Promise.all(items.map((item) => lookupOffers(item, Boolean(body.refresh))));
  return NextResponse.json({
    ok: true,
    updatedAt: new Date().toISOString(),
    results,
  });
}
