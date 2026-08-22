"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { company } from "@/lib/company";

export default function InquiryPage() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">문의가 접수되었습니다.</h1>
        <p className="mt-2 text-slate-500">
          v0.1.0은 서버 전송 없이 이 화면에서 접수 완료를 보여 줍니다. 실제 메일은 {company.email}로 연결될 예정입니다.
        </p>
        <Button className="mt-6" onClick={() => setSent(false)}>
          다른 문의 작성
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">견적·문의</h1>
      <p className="mt-2 text-sm text-slate-500">맞춤 제어반, 납기, 대량 구매는 이 양식으로 남겨 주세요.</p>
      <form
        className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <div>
          <Label htmlFor="name">담당자</Label>
          <Input id="name" className="mt-1" required />
        </div>
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" className="mt-1" required />
        </div>
        <div>
          <Label htmlFor="phone">연락처</Label>
          <Input id="phone" className="mt-1" required />
        </div>
        <div>
          <Label htmlFor="body">문의 내용</Label>
          <Textarea id="body" className="mt-1" required />
        </div>
        <Button type="submit" className="w-full">
          보내기
        </Button>
      </form>
    </div>
  );
}
