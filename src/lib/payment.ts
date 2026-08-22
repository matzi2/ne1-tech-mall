export type PaymentMethod = "transfer" | "card";

export const paymentMethods: {
  id: PaymentMethod;
  title: string;
  summary: string;
}[] = [
  {
    id: "transfer",
    title: "무통장 송금",
    summary: "기업은행 계좌로 입금하면 확인 후 출고합니다. 입금자명을 주문 시 적어 주세요.",
  },
  {
    id: "card",
    title: "신용·체크카드",
    summary: "국내 신용/체크카드로 바로 결제합니다. v0.1.0은 카드사 연동 전 테스트 결제입니다.",
  },
];

export function maskCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function isValidCardNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 15 || digits.length === 16;
}

export function isValidExpiry(value: string) {
  const match = value.replace(/\s/g, "").match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  return month >= 1 && month <= 12;
}
