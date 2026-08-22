"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";
import { company } from "@/lib/company";

export default function BankConnectPage() {
  const [depositor, setDepositor] = useState("");
  const [done, setDone] = useState(false);

  function confirm(event: React.FormEvent) {
    event.preventDefault();
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.bank = { confirmed: true, depositor: depositor.trim() || company.ceo, at: new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">IBK 기업은행</p>
        <h1 className="mt-1 text-2xl font-bold text-[#000092]">무통장 송금 안내 창</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          주문 시 아래 계좌로 입금합니다. 입금자명은 이 Chrome 작업창에서 맞춰 두세요.
        </p>
        <dl className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">은행</dt>
            <dd className="font-semibold">{company.bank.name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">계좌</dt>
            <dd className="font-mono font-semibold">{company.bank.account}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">예금주</dt>
            <dd className="font-semibold">{company.bank.holder}</dd>
          </div>
        </dl>
        <form className="mt-5 space-y-3" onSubmit={confirm}>
          <div>
            <Label htmlFor="depositor">입금자명</Label>
            <Input id="depositor" className="mt-1" value={depositor} onChange={(event) => setDepositor(event.target.value)} />
          </div>
          <Button type="submit" variant="navy" className="w-full">
            송금 안내 확인
          </Button>
          {done ? <p className="text-sm text-emerald-700">입금자명을 저장했습니다. 주문 시 이 이름을 사용하세요.</p> : null}
        </form>
        <p className="mt-4 text-xs text-slate-500">계좌번호는 테스트용입니다. 실제 운영 전 재무 계좌를 다시 확인하세요.</p>
      </div>
    </div>
  );
}
