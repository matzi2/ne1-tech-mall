export type InquiryStatus = "received" | "reviewing" | "quoted";

export type InquiryItem = {
  slug: string;
  sku: string;
  name: string;
  qty: number;
  unitPrice: number | null;
};

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  body: string;
  items: InquiryItem[];
  status: InquiryStatus;
};

export const INQUIRY_STORAGE = "ne1-inquiries-v025";

export const inquiryStatusLabel: Record<InquiryStatus, string> = {
  received: "접수",
  reviewing: "검토 중",
  quoted: "견적 회신",
};

export function inquiryTotal(items: InquiryItem[]) {
  return items.reduce((sum, item) => {
    if (item.unitPrice === null) return sum;
    return sum + item.unitPrice * item.qty;
  }, 0);
}
