"use client";

import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";
import { openExternalWindow } from "@/lib/work-window";

export default function OriginConnectPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">ORIGIN.CURSOR.COM</p>
        <h1 className="mt-1 text-2xl font-bold text-[#000092]">Cursor Origin 원격</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          이 작업 공간은 이미 Cursor Origin git 원격에 연결되어 있습니다. GitHub를 추가해도 Origin은 그대로 두고,
          <code className="mx-1">github</code> 리모트만 새로 붙입니다.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>패키지: {company.nameEn} mall v{company.version}</li>
          <li>브랜치: main</li>
          <li>원격 이름: origin (Cursor) / github (연결 후)</li>
        </ul>
        <Button
          type="button"
          className="mt-5"
          onClick={() => openExternalWindow("https://cursor.com", "cursor-origin", { width: 1100, height: 800 })}
        >
          Cursor 열기
        </Button>
      </div>
    </div>
  );
}
