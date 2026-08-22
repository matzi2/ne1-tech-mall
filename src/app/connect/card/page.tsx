"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";
import { isValidCardNumber, isValidExpiry, maskCardNumber } from "@/lib/payment";

export default function CardConnectPage() {
  const [form, setForm] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  function pay(event: React.FormEvent) {
    event.preventDefault();
    if (!isValidCardNumber(form.number)) {
      setError("카드번호 15~16자리를 입력해 주세요.");
      return;
    }
    if (!isValidExpiry(form.expiry)) {
      setError("유효기간은 MM/YY 입니다.");
      return;
    }
    if (form.cvc.replace(/\D/g, "").length < 3) {
      setError("CVC 3~4자리를 입력해 주세요.");
      return;
    }
    const last4 = form.number.replace(/\D/g, "").slice(-4);
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.card = { tested: true, last4, at: new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    setError("");
    setDone(`테스트 승인 완료 · 카드 끝자리 ${last4}. 실제 카드사 청구는 없습니다.`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#000092] px-6 py-5 text-white">
          <p className="text-xs tracking-wide text-white/70">NE1-TECH PAY</p>
          <h1 className="mt-1 text-xl font-bold">신용·체크카드 결제 창</h1>
          <p className="mt-1 text-sm text-white/70">카드사 PG 연동 전 작업용 화면입니다. 이 창에서 번호를 넣고 승인을 확인하세요.</p>
        </div>
        <form className="space-y-4 p-6" onSubmit={pay}>
          <div>
            <Label htmlFor="name">카드 소유자</Label>
            <Input id="name" className="mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="number">카드번호</Label>
            <Input
              id="number"
              className="mt-1 font-mono"
              placeholder="ACCT-000003"
              value={form.number}
              onChange={(event) => setForm({ ...form, number: maskCardNumber(event.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="expiry">유효기간</Label>
              <Input
                id="expiry"
                className="mt-1 font-mono"
                placeholder="MM/YY"
                value={form.expiry}
                onChange={(event) => setForm({ ...form, expiry: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                className="mt-1 font-mono"
                value={form.cvc}
                onChange={(event) => setForm({ ...form, cvc: event.target.value.replace(/\D/g, "").slice(0, 4) })}
              />
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {done ? <p className="text-sm text-emerald-700">{done}</p> : null}
          <Button type="submit" className="w-full" size="lg">
            결제 테스트 승인
          </Button>
          <p className="text-xs text-slate-500">카드 번호는 서버로 보내지 않으며, 끝 4자리만 이 브라우저에 표시용으로 남습니다.</p>
        </form>
      </div>
    </div>
  );
}
