"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONNECTIONS_STORAGE, KAKAO_KEYS_STORAGE, type KakaoKeys, type LocalConnectionState } from "@/lib/connections";
import { company } from "@/lib/company";
import { openExternalWindow } from "@/lib/work-window";

const empty: KakaoKeys = {
  restApiKey: "",
  javascriptKey: "",
  redirectUri: "",
};

export default function KakaoDevelopersPage() {
  const [form, setForm] = useState<KakaoKeys>(empty);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KAKAO_KEYS_STORAGE);
    if (stored) setForm({ ...empty, ...(JSON.parse(stored) as KakaoKeys) });
    setForm((prev) => ({
      ...prev,
      redirectUri: prev.redirectUri || `${window.location.origin}/redirect`,
    }));
  }, []);

  function save(event: React.FormEvent) {
    event.preventDefault();
    localStorage.setItem(KAKAO_KEYS_STORAGE, JSON.stringify(form));
    const local = JSON.parse(localStorage.getItem(CONNECTIONS_STORAGE) || "{}") as LocalConnectionState;
    local.kakaoDevelopers = { saved: true, at: new Date().toISOString() };
    localStorage.setItem(CONNECTIONS_STORAGE, JSON.stringify(local));
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-[#0046CA]">DEVELOPERS.KAKAO.COM</p>
        <h1 className="mt-1 text-2xl font-bold text-[#000092]">카카오 디벨로퍼스 작업 창</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          카카오 콘솔에서 앱을 만든 뒤 Redirect URI에 <code>{company.siteUrl}/redirect</code> 와 이 미리보기 주소를 등록하세요.
          키를 저장하면 로그인 창이 실제 kauth.kakao.com 으로 넘어갈 수 있습니다.
        </p>
        <Button
          type="button"
          className="mt-4"
          onClick={() =>
            openExternalWindow("https://developers.kakao.com/console/app", "kakao-console", {
              width: 1100,
              height: 820,
            })
          }
        >
          카카오 디벨로퍼스 콘솔 열기
        </Button>
        <form className="mt-6 space-y-4" onSubmit={save}>
          <div>
            <Label htmlFor="rest">REST API 키</Label>
            <Input
              id="rest"
              className="mt-1 font-mono"
              value={form.restApiKey}
              onChange={(event) => setForm({ ...form, restApiKey: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="js">JavaScript 키</Label>
            <Input
              id="js"
              className="mt-1 font-mono"
              value={form.javascriptKey}
              onChange={(event) => setForm({ ...form, javascriptKey: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="redirect">Redirect URI</Label>
            <Input
              id="redirect"
              className="mt-1 font-mono"
              value={form.redirectUri}
              onChange={(event) => setForm({ ...form, redirectUri: event.target.value })}
            />
          </div>
          <Button type="submit" variant="navy">
            이 브라우저에 키 저장
          </Button>
          {saved ? <p className="text-sm text-emerald-700">저장했습니다. 카카오 로그인 창을 다시 열어 주세요.</p> : null}
        </form>
        <p className="mt-4 text-xs text-slate-500">
          Client Secret은 서버 환경변수에만 둡니다. 이 화면에는 붙여 넣지 마세요.
        </p>
      </div>
    </div>
  );
}
