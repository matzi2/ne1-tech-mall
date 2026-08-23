"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { company, demoAccounts, type Role } from "@/lib/company";
import type { Inquiry, InquiryItem, InquiryStatus } from "@/lib/inquiries";
import { INQUIRY_STORAGE } from "@/lib/inquiries";
import { isPurgeDue, type MemberRecord, type MemberStatus } from "@/lib/membership";
import { products as seedProducts } from "@/lib/products";
import type { CatalogProduct } from "@/lib/catalog";
import type { PaymentMethod } from "@/lib/payment";
import { pointsFromAmount } from "@/lib/points";

export type { Inquiry, InquiryItem, InquiryStatus };

export type { Role };

export type SessionUser = {
  email: string;
  name: string;
  role: Role;
  status?: MemberStatus;
  createdAt?: string;
  withdrawnAt?: string;
  purgeAt?: string;
};

export type StoredUser = SessionUser;

export type CartItem = { slug: string; qty: number };

export type OrderItem = {
  slug: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number | null;
};

export type Order = {
  id: string;
  email: string | null;
  buyerName: string;
  buyerPhone: string;
  companyName: string;
  memo: string;
  items: OrderItem[];
  productTotal: number;
  pointsUsed: number;
  payable: number;
  pointsEarned: number;
  paymentMethod: PaymentMethod;
  status: "pending-transfer" | "paid";
  cardLast4?: string;
  depositor?: string;
  createdAt: string;
};

export type PointEntry = {
  id: string;
  email: string;
  delta: number;
  balance: number;
  reason: string;
  orderId?: string;
  createdAt: string;
};

type CheckoutInput = {
  buyerName: string;
  buyerPhone: string;
  companyName: string;
  memo: string;
  paymentMethod: PaymentMethod;
  pointsUsed: number;
  depositor?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
};

const AUTH_KEY = "ne1-auth-v012";
const USERS_KEY = "ne1-users-v012";
const CART_KEY = "ne1-cart-v010";
const CATALOG_KEY = "ne1-catalog-v010";
const ORDERS_KEY = "ne1-orders-v010";
const POINTS_KEY = "ne1-points-v010";
const INQUIRIES_KEY = INQUIRY_STORAGE;

type InquiryInput = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  body: string;
  items: InquiryItem[];
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function seedUsers(): StoredUser[] {
  return demoAccounts.map((account) => ({
    email: account.email,
    name: account.name,
    role: account.role,
    status: "active" as const,
    createdAt: company.founded,
  }));
}

function applyMember(user: SessionUser, member?: MemberRecord | null): SessionUser {
  if (!member) return { ...user, status: user.status ?? "active" };
  return {
    ...user,
    name: member.name || user.name,
    role: member.role || user.role,
    status: member.status,
    createdAt: member.createdAt,
    withdrawnAt: member.withdrawnAt,
    purgeAt: member.purgeAt,
  };
}

function toSeedCatalog(): CatalogProduct[] {
  return seedProducts.map((product) => ({
    ...product,
    photos: [],
    documents: [],
    source: "seed" as const,
    createdAt: company.founded,
  }));
}

type AppState = {
  ready: boolean;
  user: SessionUser | null;
  users: StoredUser[];
  cart: CartItem[];
  extras: CatalogProduct[];
  orders: Order[];
  points: PointEntry[];
  inquiries: Inquiry[];
  catalog: CatalogProduct[];
  cartCount: number;
  cartLines: { product: CatalogProduct; qty: number }[];
  productTotal: number;
  pointBalance: number;
  applySession: (user: SessionUser, member?: MemberRecord | null) => void;
  loginWithKakao: (input: { nickname: string; account: string }) => void;
  signup: (input: { name: string; email: string; role: Role }) => string | null;
  logout: () => void;
  withdrawAccount: (reason?: string) => Promise<string | null>;
  cancelWithdrawal: () => Promise<string | null>;
  purgeExpiredAccounts: () => { emails: string[] };
  addToCart: (slug: string, qty?: number) => void;
  updateQty: (slug: string, qty: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  addProducts: (items: CatalogProduct[]) => { added: number; skipped: number };
  getProduct: (slug: string) => CatalogProduct | undefined;
  checkout: (input: CheckoutInput) => { error: string } | { order: Order };
  confirmTransfer: (orderId: string) => string | null;
  submitInquiry: (input: InquiryInput) => { error: string } | { inquiry: Inquiry };
  updateInquiryStatus: (id: string, status: InquiryStatus) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<StoredUser[]>(seedUsers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [extras, setExtras] = useState<CatalogProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [points, setPoints] = useState<PointEntry[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    const storedUsers = readJson<StoredUser[]>(USERS_KEY, []);
    const byEmail = new Map<string, StoredUser>();
    seedUsers().forEach((item) => byEmail.set(item.email, item));
    storedUsers.forEach((item) => {
      byEmail.set(item.email, { ...byEmail.get(item.email), ...item });
    });
    const merged = [...byEmail.values()].filter((item) => !isPurgeDue(item));
    const purgedEmails = [...byEmail.values()].filter(isPurgeDue).map((item) => item.email);
    const storedOrders = readJson<Order[]>(ORDERS_KEY, []);
    const storedPoints = readJson<PointEntry[]>(POINTS_KEY, []);
    const storedInquiries = readJson<Inquiry[]>(INQUIRIES_KEY, []);
    setUsers(merged);
    setCart(readJson<CartItem[]>(CART_KEY, []));
    setExtras(readJson<CatalogProduct[]>(CATALOG_KEY, []));
    setOrders(
      purgedEmails.length
        ? storedOrders.map((order) =>
            order.email && purgedEmails.includes(order.email)
              ? { ...order, email: null, buyerName: "탈퇴회원", buyerPhone: "" }
              : order,
          )
        : storedOrders,
    );
    setPoints(purgedEmails.length ? storedPoints.filter((entry) => !purgedEmails.includes(entry.email)) : storedPoints);
    setInquiries(
      purgedEmails.length ? storedInquiries.filter((item) => !purgedEmails.includes(item.email)) : storedInquiries,
    );
    const localUser = readJson<SessionUser | null>(AUTH_KEY, null);
    setUser(localUser && !isPurgeDue(localUser) ? localUser : null);
    void fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data: { user?: SessionUser | null; membership?: MemberRecord | null }) => {
        if (data.user) setUser(applyMember(data.user, data.membership));
      })
      .catch(() => undefined);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    localStorage.setItem(CATALOG_KEY, JSON.stringify(extras));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    localStorage.setItem(POINTS_KEY, JSON.stringify(points));
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  }, [ready, users, user, cart, extras, orders, points, inquiries]);

  const catalog = useMemo(() => {
    const extrasBySlug = new Set(extras.map((item) => item.slug));
    return [...toSeedCatalog().filter((item) => !extrasBySlug.has(item.slug)), ...extras];
  }, [extras]);

  const cartLines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = catalog.find((item) => item.slug === line.slug);
          return product ? { product, qty: line.qty } : null;
        })
        .filter((line): line is { product: CatalogProduct; qty: number } => Boolean(line)),
    [cart, catalog],
  );

  const productTotal = cartLines.reduce((sum, line) => {
    if (line.product.price === null) return sum;
    return sum + line.product.price * line.qty;
  }, 0);

  const pointBalance = useMemo(() => {
    if (!user) return 0;
    const mine = points.filter((entry) => entry.email === user.email);
    return mine.at(-1)?.balance ?? 0;
  }, [points, user]);

  const applySession = useCallback((next: SessionUser, member?: MemberRecord | null) => {
    const merged = applyMember(next, member);
    setUsers((prev) => {
      const existing = prev.find((item) => item.email === merged.email);
      const record = {
        ...existing,
        ...merged,
        status: merged.status ?? existing?.status ?? "active",
        createdAt: existing?.createdAt ?? merged.createdAt ?? new Date().toISOString(),
      };
      if (existing) return prev.map((item) => (item.email === record.email ? record : item));
      return [...prev, record];
    });
    setUser(merged);
  }, []);

  const signup = useCallback((input: { name: string; email: string; role: Role }) => {
    const email = input.email.trim().toLowerCase();
    if (!input.name.trim()) return "이름을 입력해 주세요.";
    if (!email.includes("@")) return "올바른 이메일을 입력해 주세요.";
    return null;
  }, []);

  const loginWithKakao = useCallback(
    (input: { nickname: string; account: string }) => {
      const account = input.account.trim();
      const email = account.includes("@")
        ? account.toLowerCase()
        : `kakao-${account.replace(/\W/g, "") || "user"}@kakao.ne1-tech.local`;
      setUsers((prev) => {
        if (prev.some((item) => item.email === email)) return prev;
        return [
          ...prev,
          {
            email,
            name: input.nickname.trim() || "카카오회원",
            role: "member",
            status: "active",
            createdAt: new Date().toISOString(),
          },
        ];
      });
      setUser((prev) => {
        const name = input.nickname.trim() || prev?.name || "카카오회원";
        return { email, name, role: prev?.email === email ? prev.role : "member" };
      });
    },
    [],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; nickname?: string; account?: string };
      if (data?.type === "ne1-kakao-login" && data.account) {
        loginWithKakao({ nickname: data.nickname || "카카오회원", account: data.account });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [loginWithKakao]);

  const logout = useCallback(() => {
    setUser(null);
    void fetch("/api/auth/logout", { method: "POST" });
  }, []);

  const withdrawAccount = useCallback(async (reason?: string) => {
    const response = await fetch("/api/auth/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "withdraw", reason }),
    });
    const data = (await response.json()) as { ok?: boolean; message?: string; member?: MemberRecord };
    if (!data.ok || !data.member) return data.message ?? "탈퇴를 처리하지 못했습니다.";
    setUsers((prev) => prev.map((item) => (item.email === data.member!.email ? applyMember(item, data.member) : item)));
    setUser(null);
    void fetch("/api/auth/logout", { method: "POST" });
    return null;
  }, []);

  const cancelWithdrawal = useCallback(async () => {
    const response = await fetch("/api/auth/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = (await response.json()) as { ok?: boolean; message?: string; member?: MemberRecord };
    if (!data.ok || !data.member) return data.message ?? "탈퇴를 취소하지 못했습니다.";
    const restored = applyMember(
      { email: data.member.email, name: data.member.name, role: data.member.role },
      data.member,
    );
    setUsers((prev) => prev.map((item) => (item.email === restored.email ? restored : item)));
    setUser(restored);
    return null;
  }, []);

  const purgeExpiredAccounts = useCallback(() => {
    const due = users.filter(isPurgeDue);
    const emails = due.map((item) => item.email);
    if (!emails.length) return { emails };
    setUsers((prev) => prev.filter((item) => !emails.includes(item.email)));
    setPoints((prev) => prev.filter((entry) => !emails.includes(entry.email)));
    setInquiries((prev) => prev.filter((item) => !emails.includes(item.email)));
    setOrders((prev) =>
      prev.map((order) =>
        order.email && emails.includes(order.email)
          ? { ...order, email: null, buyerName: "탈퇴회원", buyerPhone: "" }
          : order,
      ),
    );
    if (user && emails.includes(user.email)) setUser(null);
    return { emails };
  }, [user, users]);

  const addToCart = useCallback((slug: string, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.slug === slug);
      if (existing) {
        return prev.map((item) =>
          item.slug === slug ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [...prev, { slug, qty }];
    });
  }, []);

  const updateQty = useCallback((slug: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((item) => item.slug !== slug) : prev.map((item) =>
        item.slug === slug ? { ...item, qty } : item,
      ),
    );
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCart((prev) => prev.filter((item) => item.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const addProducts = useCallback((items: CatalogProduct[]) => {
    const slugs = new Set(catalog.map((item) => item.slug));
    const skus = new Set(catalog.map((item) => item.sku));
    const accepted: CatalogProduct[] = [];
    let skipped = 0;
    items.forEach((item) => {
      if (slugs.has(item.slug) || skus.has(item.sku)) {
        skipped += 1;
        return;
      }
      slugs.add(item.slug);
      skus.add(item.sku);
      accepted.push(item);
    });
    if (accepted.length) setExtras((prev) => [...prev, ...accepted]);
    return { added: accepted.length, skipped };
  }, [catalog]);

  const getProduct = useCallback(
    (slug: string) => catalog.find((item) => item.slug === slug),
    [catalog],
  );

  const pushPoints = useCallback(
    (email: string, delta: number, reason: string, orderId?: string) => {
      setPoints((prev) => {
        const current = [...prev].reverse().find((entry) => entry.email === email)?.balance ?? 0;
        const balance = Math.max(0, current + delta);
        return [
          ...prev,
          {
            id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            email,
            delta,
            balance,
            reason,
            orderId,
            createdAt: new Date().toISOString(),
          },
        ];
      });
    },
    [],
  );

  const checkout = useCallback(
    (input: CheckoutInput) => {
      if (!cartLines.length) return { error: "장바구니가 비어 있습니다." };
      if (!input.buyerName.trim() || !input.buyerPhone.trim()) {
        return { error: "주문자 이름과 연락처를 입력해 주세요." };
      }
      const maxPoints = user ? Math.min(pointBalance, productTotal) : 0;
      const pointsUsed = Math.max(0, Math.min(input.pointsUsed, maxPoints));
      const payable = Math.max(0, productTotal - pointsUsed);
      const earned = user ? pointsFromAmount(payable) : 0;

      if (input.paymentMethod === "transfer" && !input.depositor?.trim()) {
        return { error: "송금 시 입금자명을 입력해 주세요." };
      }
      if (input.paymentMethod === "card") {
        const digits = (input.cardNumber ?? "").replace(/\D/g, "");
        if (digits.length < 15) return { error: "카드번호를 확인해 주세요." };
        if (!input.cardExpiry || !input.cardCvc) {
          return { error: "카드 유효기간과 CVC를 입력해 주세요." };
        }
      }

      const order: Order = {
        id: `NE1-${Date.now().toString().slice(-8)}`,
        email: user?.email ?? null,
        buyerName: input.buyerName.trim(),
        buyerPhone: input.buyerPhone.trim(),
        companyName: input.companyName.trim(),
        memo: input.memo.trim(),
        items: cartLines.map((line) => ({
          slug: line.product.slug,
          name: line.product.name,
          sku: line.product.sku,
          qty: line.qty,
          unitPrice: line.product.price,
        })),
        productTotal,
        pointsUsed,
        payable,
        pointsEarned: earned,
        paymentMethod: input.paymentMethod,
        status: input.paymentMethod === "card" ? "paid" : "pending-transfer",
        cardLast4:
          input.paymentMethod === "card"
            ? (input.cardNumber ?? "").replace(/\D/g, "").slice(-4)
            : undefined,
        depositor: input.depositor?.trim(),
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [order, ...prev]);
      if (user && pointsUsed > 0) {
        pushPoints(user.email, -pointsUsed, `주문 ${order.id} 포인트 사용`, order.id);
      }
      if (user && earned > 0 && order.status === "paid") {
        pushPoints(user.email, earned, `주문 ${order.id} 구매 적립`, order.id);
      }
      setCart([]);
      return { order };
    },
    [cartLines, pointBalance, productTotal, pushPoints, user],
  );

  const submitInquiry = useCallback((input: InquiryInput) => {
    if (!input.name.trim() || !input.email.trim() || !input.phone.trim() || !input.body.trim()) {
      return { error: "담당자, 이메일, 연락처, 문의 내용을 입력해 주세요." };
    }
    if (!input.email.includes("@")) return { error: "올바른 이메일을 입력해 주세요." };
    const inquiry: Inquiry = {
      id: `INQ-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      companyName: input.companyName.trim(),
      body: input.body.trim(),
      items: input.items,
      status: "received",
    };
    setInquiries((prev) => [inquiry, ...prev]);
    return { inquiry };
  }, []);

  const updateInquiryStatus = useCallback((id: string, status: InquiryStatus) => {
    setInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }, []);

  const confirmTransfer = useCallback(
    (orderId: string) => {
      const target = orders.find((item) => item.id === orderId);
      if (!target) return "주문을 찾지 못했습니다.";
      if (target.status === "paid") return "이미 입금 확인된 주문입니다.";
      setOrders((prev) =>
        prev.map((item) => (item.id === orderId ? { ...item, status: "paid" } : item)),
      );
      if (target.email && target.pointsEarned > 0) {
        pushPoints(target.email, target.pointsEarned, `주문 ${target.id} 입금 확인 적립`, target.id);
      }
      return null;
    },
    [orders, pushPoints],
  );

  const value: AppState = {
    ready,
    user,
    users,
    cart,
    extras,
    orders,
    points,
    inquiries,
    catalog,
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
    cartLines,
    productTotal,
    pointBalance,
    applySession,
    loginWithKakao,
    signup,
    logout,
    withdrawAccount,
    cancelWithdrawal,
    purgeExpiredAccounts,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    addProducts,
    getProduct,
    checkout,
    confirmTransfer,
    submitInquiry,
    updateInquiryStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProviders");
  return ctx;
}
