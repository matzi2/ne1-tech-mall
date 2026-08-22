"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FindAccountPage() {
  const { users } = useApp();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-navy">아이디·비밀번호 찾기</h1>
        <p className="mt-2 text-sm text-slate-500">
          v0.1.0은 브라우저에 저장된 회원만 찾습니다. 가입 이메일을 입력해 주세요.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const found = users.find((user) => user.email === email.trim().toLowerCase());
            setResult(
              found
                ? `${found.name} 계정입니다. 테스트 비밀번호는 가입 시 설정한 값이며, 데모 계정은 demo1234 입니다.`
                : "해당 이메일로 가입된 계정이 없습니다.",
            );
          }}
        >
          <div>
            <Label htmlFor="email">가입 이메일</Label>
            <Input id="email" type="email" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">
            찾기
          </Button>
        </form>
        {result ? <p className="mt-4 text-sm text-slate-700">{result}</p> : null}
        <Link href="/login" className="mt-6 inline-block text-sm text-sky-700">
          로그인 화면으로
        </Link>
      </div>
    </div>
  );
}
