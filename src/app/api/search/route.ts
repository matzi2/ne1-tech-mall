import { NextResponse } from "next/server";
import {
  looksConversational,
  mergeSearchIntent,
  parseSearchIntent,
  type SearchIntent,
} from "@/lib/smart-search";
import type { CategoryGroupId, ProductCategory } from "@/lib/products";
import { categories, categoryGroups } from "@/lib/products";

export const runtime = "nodejs";

const CATEGORY_IDS = categories.map((item) => item.id).filter((id): id is ProductCategory => id !== "all");
const GROUP_IDS = categoryGroups.map((item) => item.id);

function asCategory(value: unknown): ProductCategory | null {
  return typeof value === "string" && CATEGORY_IDS.includes(value as ProductCategory)
    ? (value as ProductCategory)
    : null;
}

function asGroup(value: unknown): CategoryGroupId | null {
  return typeof value === "string" && GROUP_IDS.includes(value as CategoryGroupId)
    ? (value as CategoryGroupId)
    : null;
}

async function refineWithModel(query: string, local: SearchIntent, apiKey: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "전자부품 검색 의도를 JSON으로만 답한다. keys: categories(string[]), groups(string[]), specValues(string[]), stock(in-stock|limited|made-to-order|null), keywords(string[]), summary(string). 카테고리는 ic,discrete,sensor,passive,mcu,led,lcd,power,battery,connector,terminal,pcb,switch,breaker,elcb,fuse,surge,contactor,relay,motor,cable,tool,meter 만. 없는 값은 빈 배열/null.",
          },
          { role: "user", content: query },
        ],
      }),
    });
    if (!response.ok) return local;
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}") as {
      categories?: unknown[];
      groups?: unknown[];
      specValues?: unknown[];
      stock?: SearchIntent["stock"];
      keywords?: unknown[];
      summary?: string;
    };
    return mergeSearchIntent(local, {
      categories: (parsed.categories ?? []).map(asCategory).filter((item): item is ProductCategory => Boolean(item)),
      groups: (parsed.groups ?? []).map(asGroup).filter((item): item is CategoryGroupId => Boolean(item)),
      specValues: (parsed.specValues ?? []).filter((item): item is string => typeof item === "string"),
      stock: parsed.stock === "in-stock" || parsed.stock === "limited" || parsed.stock === "made-to-order" ? parsed.stock : null,
      keywords: (parsed.keywords ?? []).filter((item): item is string => typeof item === "string"),
      summary: typeof parsed.summary === "string" ? parsed.summary : local.summary,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { query?: string };
  const query = String(body.query ?? "").trim();
  const local = parseSearchIntent(query);
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!query || !apiKey || !looksConversational(query)) {
    return NextResponse.json({
      source: "local",
      intent: local,
      modelReady: Boolean(apiKey),
    });
  }

  try {
    const intent = await refineWithModel(query, local, apiKey);
    return NextResponse.json({ source: "llm", intent, modelReady: true });
  } catch {
    return NextResponse.json({ source: "local", intent: local, modelReady: true });
  }
}
