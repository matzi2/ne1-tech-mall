"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/format";
import { isValidCardNumber, isValidExpiry, maskCardNumber, paymentMethods } from "@/lib/payment";
import { formatPoints, pointsFromAmount } from "@/lib/points";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartLines, productTotal, user, pointBalance, checkout } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "card">("transfer");
  const [pointsUsed, setPointsUsed] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    buyerName: user?.name ?? "",
    buyerPhone: "",
    companyName: "",
    memo: "",
    depositor: user?.name ?? "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const maxPoints = user ? Math.min(pointBalance, productTotal) : 0;
  const payable = Math.max(0, productTotal - pointsUsed);
  const willEarn = user ? pointsFromAmount(payable) : 0;

  const quoteItems = useMemo(
    () => cartLines.filter((line) => line.product.price === null),
    [cartLines],
  );

  if (cartLines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">결제할 상품이 없습니다.</h1>
        <Button asChild className="mt-6">
          <Link href="/products">제품몰</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          if (paymentMethod === "card") {
            if (!isValidCardNumber(form.cardNumber)) {
              setError("카드번호 15~16자리를 입력해 주세요.");
              return;
            }
            if (!isValidExpiry(form.cardExpiry)) {
              setError("유효기간은 MM/YY 형식으로 입력해 주세요.");
              return;
            }
          }
          const result = checkout({
            ...form,
            paymentMethod,
            pointsUsed,
          });
          if ("error" in result) {
            setError(result.error);
            return;
          }
          router.push(`/checkout/complete?order=${result.order.id}`);
        }}
      >
        <h1 className="text-2xl font-bold text-navy">주문·결제</h1>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">주문자</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="buyerName">이름</Label>
              <Input
                id="buyerName"
                className="mt-1"
                value={form.buyerName}
                onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="buyerPhone">연락처</Label>
              <Input
                id="buyerPhone"
                className="mt-1"
                value={form.buyerPhone}
                onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                placeholder="010-0000-0000"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="companyName">회사명 (선택)</Label>
              <Input
                id="companyName"
                className="mt-1"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="memo">요청사항</Label>
              <Textarea
                id="memo"
                className="mt-1"
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">결제 수단</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`rounded-xl border p-4 text-left ${
                  paymentMethod === method.id ? "border-sky-500 bg-sky-50" : "border-slate-200"
                }`}
              >
                <p className="font-semibold text-navy">{method.title}</p>
                <p className="mt-1 text-sm text-slate-500">{method.summary}</p>
              </button>
            ))}
          </div>
          {paymentMethod === "transfer" ? (
            <div className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4 text-sm">
              <p>
                {company.bank.name} {company.bank.account} / 예금주 {company.bank.holder}
              </p>
              <div>
                <Label htmlFor="depositor">입금자명</Label>
                <Input
                  id="depositor"
                  className="mt-1 bg-white"
                  value={form.depositor}
                  onChange={(e) => setForm({ ...form, depositor: e.target.value })}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="cardNumber">카드번호</Label>
                <Input
                  id="cardNumber"
                  className="mt-1"
                  inputMode="numeric"
                  placeholder="ACCT-000003"
                  value={form.cardNumber}
                  onChange={(e) => setForm({ ...form, cardNumber: maskCardNumber(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="cardExpiry">유효기간</Label>
                <Input
                  id="cardExpiry"
                  className="mt-1"
                  placeholder="MM/YY"
                  value={form.cardExpiry}
                  onChange={(e) => setForm({ ...form, cardExpiry: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cardCvc">CVC</Label>
                <Input
                  id="cardCvc"
                  className="mt-1"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.cardCvc}
                  onChange={(e) => setForm({ ...form, cardCvc: e.target.value.replace(/\D/g, "") })}
                />
              </div>
              <p className="sm:col-span-2 text-xs text-slate-500">
                실제 카드사 결제는 아직 연결 전입니다. 입력값은 이 브라우저에서 주문 확인용으로만 쓰고, 카드번호는 뒷 4자리만 저장합니다.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">포인트</h2>
          {user ? (
            <div className="mt-3">
              <p className="text-sm text-slate-600">
                보유 {formatPoints(pointBalance)} · 이번 주문 적립 예정 {formatPoints(willEarn)}
              </p>
              <Label htmlFor="pointsUsed" className="mt-3 block">
                사용할 포인트
              </Label>
              <Input
                id="pointsUsed"
                type="number"
                min={0}
                max={maxPoints}
                className="mt-1 w-40"
                value={pointsUsed}
                onChange={(e) =>
                  setPointsUsed(Math.max(0, Math.min(maxPoints, Number(e.target.value) || 0)))
                }
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              <Link href="/login" className="font-medium text-sky-700">
                로그인
              </Link>
              하면 결제 금액의 1%가 적립되고, 다음 주문에서 1P=1원으로 쓸 수 있습니다.
            </p>
          )}
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" size="lg">
          {formatPrice(payable)} {paymentMethod === "card" ? "카드 결제" : "송금 주문"}하기
        </Button>
      </form>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">주문 상품</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {cartLines.map((line) => (
            <li key={line.product.slug} className="flex justify-between gap-3">
              <span>
                {line.product.name} × {line.qty}
              </span>
              <span>{formatPrice(line.product.price === null ? null : line.product.price * line.qty)}</span>
            </li>
          ))}
        </ul>
        {quoteItems.length > 0 ? (
          <p className="mt-3 text-xs text-amber-700">
            견적 상품은 이번 결제에 포함되지 않습니다. 주문 후 별도 안내합니다.
          </p>
        ) : null}
        <div className="mt-4 space-y-1 border-t pt-3 text-sm">
          <p className="flex justify-between">
            <span>상품 합계</span>
            <span>{formatPrice(productTotal)}</span>
          </p>
          <p className="flex justify-between">
            <span>포인트 사용</span>
            <span>-{formatPrice(pointsUsed)}</span>
          </p>
          <p className="flex justify-between text-base font-bold text-navy">
            <span>결제 금액</span>
            <span>{formatPrice(payable)}</span>
          </p>
        </div>
      </aside>
    </div>
  );
}
