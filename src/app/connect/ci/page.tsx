"use client";

import { Button } from "@/components/ui/button";
import { Ne1Logo } from "@/components/ne1-logo";
import { brand } from "@/lib/brand";
import { CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";
import { useState } from "react";

const swatches = [
  { name: "Navy", value: brand.navy },
  { name: "Blue", value: brand.blue },
  { name: "Red", value: brand.red },
];

export default function CiConnectPage() {
  const [done, setDone] = useState(false);

  function markReviewed() {
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.ci = { reviewed: true, at: new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">N-ONETECH.COM</p>
        <h1 className="mt-1 text-2xl font-bold text-[#000092]">CI 비교 작업 창</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          엔원테크 홈페이지와 같은 남색·파랑·빨강을 이 인앱 브라우저에서 확인합니다.
        </p>
        <div className="mt-5 flex h-20 items-center rounded-xl bg-[#000092] px-5">
          <Ne1Logo />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {swatches.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="h-16" style={{ background: item.value }} />
              <p className="px-3 py-2 text-xs font-mono">
                {item.name} {item.value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600">서체: Pretendard · 영문 Montserrat</p>
        <div className="mt-5">
          <Button type="button" variant="navy" onClick={markReviewed}>
            CI 확인 완료
          </Button>
        </div>
        {done ? <p className="mt-3 text-sm text-emerald-700">CI 확인을 기록했습니다.</p> : null}
      </div>
    </div>
  );
}
