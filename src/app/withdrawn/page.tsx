import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MEMBER_RETENTION_DAYS, retentionLabel } from "@/lib/membership";

export default function WithdrawnPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-navy">탈퇴가 접수되었습니다.</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        계정은 {retentionLabel()}({MEMBER_RETENTION_DAYS}일) 동안 보관됩니다. 그 사이 같은 이메일로 로그인하면 탈퇴를
        취소할 수 있습니다. 기간이 끝나면 회원 정보와 포인트·문의가 삭제됩니다.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/login">로그인해서 탈퇴 취소</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">쇼핑몰</Link>
        </Button>
      </div>
    </div>
  );
}
