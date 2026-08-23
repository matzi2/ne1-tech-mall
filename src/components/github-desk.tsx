"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GitHubDeskProps = {
  username: string;
  onUsernameChange: (value: string) => void;
};

export function GitHubDesk({ username, onUsernameChange }: GitHubDeskProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3 md:px-6">
        <p className="text-sm font-semibold text-[#000092]">관리자 · GitHub 로그인 창</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          이 창은 관리자 메일로 들어왔을 때만 보입니다. 쇼핑몰 메뉴에는 넣지 않습니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="navy">
            GitHub 로그인
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <a href="#github-token-desk">토큰 정보</a>
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-5 md:px-6">
        <p className="text-sm leading-6 text-slate-600">
          GitHub 아이디만 이 창에 넣습니다. Personal Access Token과 장치 코드는 아래{" "}
          <strong>토큰 정보 창</strong>에 있습니다. GitHub 사이트는 이 창 안에 넣을 수 없습니다.
        </p>

        <div>
          <Label htmlFor="gh-username">GitHub 아이디</Label>
          <Input
            id="gh-username"
            name="username"
            autoComplete="username"
            className="mt-1"
            placeholder="예: matzi2"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
