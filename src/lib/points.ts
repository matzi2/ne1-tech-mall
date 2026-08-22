import { company } from "@/lib/company";

export function pointsFromAmount(amount: number) {
  if (amount <= 0) return 0;
  return Math.floor(amount / company.points.wonPerPoint);
}

export function formatPoints(points: number) {
  return `${points.toLocaleString("ko-KR")}P`;
}
