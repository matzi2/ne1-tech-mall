"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { useBom } from "@/components/bom-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bomCsv, downloadTextFile, parseBomCsv, resolveBomRows } from "@/lib/bom";
import { filterCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

function BomBody() {
  const params = useSearchParams();
  const router = useRouter();
  const { catalog, addToCart, ready } = useApp();
  const bom = useBom();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [importMessage, setImportMessage] = useState("");

  const rows = useMemo(() => resolveBomRows(catalog, bom.lines), [bom.lines, catalog]);
  const pricedTotal = rows.reduce((sum, row) => sum + (row.lineTotal ?? 0), 0);
  const quoteOnly = rows.some((row) => row.product.price === null);
  const suggestions = useMemo(
    () => (query.trim() ? filterCatalog(catalog, query).slice(0, 8) : []),
    [catalog, query],
  );

  function addAllToCart() {
    rows.forEach((row) => addToCart(row.product.slug, row.qty));
    router.push("/cart");
  }

  function exportCsv() {
    const csv = bomCsv(
      rows.map((row) => ({
        slug: row.slug,
        qty: row.qty,
        sku: row.product.sku,
        name: row.product.name,
        unitPrice: row.product.price,
        leadTime: row.product.leadTime,
      })),
    );
    downloadTextFile(`ne1-bom-${new Date().toISOString().slice(0, 10)}.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8");
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const parsed = parseBomCsv(text);
    if (!parsed.length) {
      setImportMessage("품번 열이 있는 CSV만 가져올 수 있습니다.");
      return;
    }
    let added = 0;
    let missing = 0;
    parsed.forEach((item) => {
      const product = catalog.find((entry) => entry.sku.toLowerCase() === item.sku.toLowerCase());
      if (!product) {
        missing += 1;
        return;
      }
      bom.mergeSku(product.sku, item.qty, product.slug);
      added += 1;
    });
    setImportMessage(
      missing
        ? `${added}개 품번을 넣었습니다. 카탈로그에 없는 품번 ${missing}개는 건너뛰었습니다.`
        : `${added}개 품번을 BOM에 넣었습니다.`,
    );
  }

  if (!ready) {
    return <p className="p-10 text-sm text-slate-500">BOM을 불러오는 중입니다.</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold tracking-wide text-[#0046CA]">BOM LIST</p>
      <h1 className="mt-1 text-3xl font-bold text-navy">BOM 리스트</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        품번을 찾아 수량을 맞춘 뒤 한 번에 장바구니에 담거나 견적으로 보냅니다. 이 목록은 이 브라우저에 저장됩니다.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="text-sm font-semibold text-navy" htmlFor="bom-search">
          품번·제품명으로 추가
        </label>
        <Input
          id="bom-search"
          className="mt-2"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: 7805, DHT22, MCCB"
        />
        {query.trim() ? (
          suggestions.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              “{query}”에 맞는 상품이 없습니다.{" "}
              <Link href="/inquiry" className="text-[#0046CA] hover:underline">
                견적·문의
              </Link>
              로 남겨 주세요.
            </p>
          ) : (
            <ul className="mt-3 divide-y rounded-xl border border-slate-100">
              {suggestions.map((item) => (
                <li key={item.slug} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-semibold text-navy hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {item.sku} · {formatPrice(item.price)}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => bom.add(item.slug, 1)}>
                    {bom.has(item.slug) ? `추가됨 ${bom.qtyOf(item.slug)}` : "BOM에 넣기"}
                  </Button>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-navy">BOM이 비어 있습니다.</p>
          <p className="mt-2 text-sm text-slate-500">
            위에서 품번을 검색하거나 제품 상세에서 BOM에 넣기를 누르면 여기에 모입니다.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/products">제품몰 보기</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/compare">스펙서치</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-medium">품번</th>
                  <th className="px-3 py-3 font-medium">제품명</th>
                  <th className="px-3 py-3 font-medium">단가</th>
                  <th className="px-3 py-3 font-medium">수량</th>
                  <th className="px-3 py-3 font-medium">합계</th>
                  <th className="px-3 py-3 font-medium">작업</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.slug} className="border-t border-slate-100">
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">{row.product.sku}</td>
                    <td className="px-3 py-3">
                      <Link href={`/products/${row.product.slug}`} className="font-semibold text-navy hover:underline">
                        {row.product.name}
                      </Link>
                      <p className="text-xs text-slate-500">{row.product.leadTime}</p>
                    </td>
                    <td className="px-3 py-3">{formatPrice(row.product.price)}</td>
                    <td className="px-3 py-3">
                      <Input
                        type="number"
                        min={1}
                        className="w-20"
                        value={row.qty}
                        onChange={(event) => bom.setQty(row.slug, Number(event.target.value) || 1)}
                      />
                    </td>
                    <td className="px-3 py-3 font-semibold text-navy">{formatPrice(row.lineTotal)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => addToCart(row.product.slug, row.qty)}>
                          담기
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => bom.remove(row.slug)}>
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-navy p-5 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/70">
                {rows.length}개 품목 · {bom.count}개
              </p>
              <p className="mt-1 text-2xl font-bold">{formatPrice(pricedTotal)}</p>
              {quoteOnly ? <p className="mt-1 text-xs text-amber-200">견적 문의 품목이 포함되어 있습니다.</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="amber" onClick={addAllToCart}>
                전부 장바구니
              </Button>
              <Button asChild variant="secondary">
                <Link href="/inquiry?from=bom">견적으로 보내기</Link>
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={exportCsv}>
                CSV 받기
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => bom.clear()}>
                비우기
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="font-semibold text-navy">CSV로 가져오기</p>
        <p className="mt-1 text-sm text-slate-500">첫 행에 품번(또는 sku), 수량(또는 qty) 열이 있으면 됩니다.</p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-3 text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importCsv(file);
            event.target.value = "";
          }}
        />
        {importMessage || bom.message ? (
          <p className="mt-2 text-sm text-slate-600">{importMessage || bom.message}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function BomPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">BOM을 불러오는 중입니다.</div>}>
      <BomBody />
    </Suspense>
  );
}
