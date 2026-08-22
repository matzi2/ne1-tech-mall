"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CONNECTIONS_STORAGE, type LocalConnectionState } from "@/lib/connections";
import { company } from "@/lib/company";
import { openExternalWindow } from "@/lib/work-window";

export default function DomainConnectPage() {
  const [lookup, setLookup] = useState("조회 전");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`https://${company.domain.toLowerCase()}`, { mode: "no-cors" })
      .then(() => setLookup("브라우저가 도메인에 요청을 보냈습니다. DNS가 없으면 사이트는 열리지 않습니다."))
      .catch(() => setLookup("지금 DNS가 없거나 사이트에 닿지 않습니다. 호스팅 연결이 필요합니다."));
  }, []);

  function mark() {
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.domain = { reviewed: true, at: new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">DOMAIN</p>
        <h1 className="mt-1 text-2xl font-bold text-[#000092]">{company.domain}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          공식 쇼핑몰 주소는 {company.siteUrl} 입니다. 이 미리보기는 개발 서버이며, 도메인 DNS·SSL·호스팅은 별도로 붙여야 합니다.
        </p>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <p>사이트 URL: {company.siteUrl}</p>
          <p>상태: {lookup}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => openExternalWindow(company.siteUrl, "ne1-domain-live", { width: 1100, height: 800 })}
          >
            공식 도메인 창 열기
          </Button>
          <Button type="button" variant="navy" onClick={mark}>
            도메인 점검 기록
          </Button>
        </div>
        {done ? <p className="mt-3 text-sm text-emerald-700">도메인 점검을 기록했습니다.</p> : null}
      </div>
    </div>
  );
}
