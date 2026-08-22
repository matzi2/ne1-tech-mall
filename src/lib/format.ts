export function formatPrice(price: number | null) {
  if (price === null || Number.isNaN(price)) return "견적 문의";
  return `${price.toLocaleString("ko-KR")}원`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
