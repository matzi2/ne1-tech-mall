"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Role } from "@/components/app-providers";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useApp();
  const [role, setRole] = useState<Role>("member");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-navy">회원가입</h1>
        <p className="mt-2 text-sm text-slate-500">가입 후 구매하면 결제금액의 1%가 포인트로 적립됩니다.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const message = signup({ ...form, role });
            if (message) {
              setError(message);
              return;
            }
            router.push("/mypage");
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={role === "member" ? "default" : "outline"} onClick={() => setRole("member")}>
              개인 회원
            </Button>
            <Button type="button" variant={role === "business" ? "default" : "outline"} onClick={() => setRole("business")}>
              사업자 회원
            </Button>
          </div>
          <div>
            <Label htmlFor="name">이름</Label>
            <Input id="name" className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" className="mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" className="mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg">
            가입하고 로그인
          </Button>
        </form>
        <p className="mt-4 text-sm">
          이미 계정이 있으면 <Link href="/login" className="text-sky-700">로그인</Link>
        </p>
      </div>
    </div>
  );
}
