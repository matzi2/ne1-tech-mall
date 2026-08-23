"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/app-providers";
import { useBom } from "@/components/bom-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveBomRows } from "@/lib/bom";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/format";

function InquiryBody() {
  const params = useSearchParams();
  const { user, catalog, submitInquiry } = useApp();
  const bom = useBom();
  const fromBom = params.get("from") === "bom";
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [body, setBody] = useState(
    fromBom ? "아래 BOM 품목으로 견적과 납기를 부탁드립니다." : "",
  );
  const [attachBom, setAttachBom] = useState(true);
  const [clearAfter, setClearAfter] = useState(false);
  const [error, setError] = useState("");
  const [sentId, setSentId] = useState("");

  const rows = useMemo(() => resolveBomRows(catalog, bom.lines), [bom.lines, catalog]);
  const attach = attachBom && rows.length > 0;
  const pricedTotal = rows.reduce((sum, row) => sum + (row.lineTotal ?? 0), 0);

  if (sentId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">문의가 접수되었습니다.</h1>
        <p className="mt-2 text-slate-500">
          접수번호 {sentId}. 이 브라우저에 저장되며, 같은 이메일로 로그인하면 마이페이지에서 볼 수 있습니다. 회신은{" "}
          {company.email}로 연결됩니다.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/mypage">마이페이지</Link>
          </Button>
          <Button variant="outline" onClick={() => setSentId("")}>
            다른 문의 작성
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">견적·문의</h1>
      <p className="mt-2 text-sm text-slate-500">
        재고, 납기, 대량 구매, BOM 견적을 남겨 주세요. 선택한 부품이 있으면 함께 접수됩니다.
      </p>
      <form
        className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          const result = submitInquiry({
            name,
            email,
            phone,
            companyName,
            body,
            items: attach
              ? rows.map((row) => ({
                  slug: row.product.slug,
                  sku: row.product.sku,
                  name: row.product.name,
                  qty: row.qty,
                  unitPrice: row.product.price,
                }))
              : [],
          });
          if ("error" in result) {
            setError(result.error);
            return;
          }
          if (clearAfter) bom.clear();
          setError("");
          setSentId(result.inquiry.id);
        }}
      >
        <div>
          <Label htmlFor="name">담당자</Label>
          <Input id="name" className="mt-1" required value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            className="mt-1"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">연락처</Label>
          <Input id="phone" className="mt-1" required value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="companyName">회사명</Label>
          <Input
            id="companyName"
            className="mt-1"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="없으면 비워 두셔도 됩니다"
          />
        </div>
        <div>
          <Label htmlFor="body">문의 내용</Label>
          <Textarea
            id="body"
            className="mt-1"
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>

        {rows.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-start gap-2 text-sm font-medium text-navy">
              <input type="checkbox" checked={attachBom} onChange={(event) => setAttachBom(event.target.checked)} />
              BOM {rows.length}개 품목 첨부
            </label>
            {attach ? (
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {rows.map((row) => (
                  <li key={row.slug} className="flex justify-between gap-3">
                    <span>
                      {row.product.sku} · {row.product.name} × {row.qty}
                    </span>
                    <span>{formatPrice(row.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {attach ? (
              <p className="mt-2 text-xs text-slate-500">참고 합계 {formatPrice(pricedTotal)}</p>
            ) : null}
            <label className="mt-3 flex items-start gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={clearAfter} onChange={(event) => setClearAfter(event.target.checked)} />
              보낸 뒤 BOM 비우기
            </label>
            <p className="mt-2 text-xs">
              <Link href="/bom" className="text-[#0046CA] hover:underline">
                BOM 리스트에서 수량 수정
              </Link>
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            첨부할 BOM이 없습니다.{" "}
            <Link href="/bom" className="text-[#0046CA] hover:underline">
              BOM 리스트
            </Link>
            에서 품번을 모은 뒤 다시 오면 견적에 붙일 수 있습니다.
          </p>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full">
          보내기
        </Button>
      </form>
    </div>
  );
}

export default function InquiryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">문의 화면을 불러오는 중입니다.</div>}>
      <InquiryBody />
    </Suspense>
  );
}
