export type WorkTab = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

/** 대화창이 달라도 Preview는 항상 이 인앱 브라우저 조건으로 연다. */
export const IN_APP_BROWSER_HOME = "/connect/github";
export const IN_APP_BROWSER_ORIGIN = "http://127.0.0.1:43177";

export const WORK_TABS: WorkTab[] = [
  {
    href: "/connect/github",
    label: "GitHub",
    match: (pathname) => pathname.startsWith("/connect/github"),
  },
  {
    href: "/login",
    label: "로그인",
    match: (pathname) =>
      pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/find-account"),
  },
  {
    href: "/connect",
    label: "연결 목록",
    match: (pathname) => pathname === "/connect",
  },
  {
    href: "/oauth2/authorization/kakao",
    label: "카카오",
    match: (pathname) => pathname.startsWith("/oauth2") || pathname.startsWith("/redirect"),
  },
  {
    href: "/connect/kakao-developers",
    label: "디벨로퍼스",
    match: (pathname) => pathname.startsWith("/connect/kakao-developers"),
  },
  {
    href: "/connect/card",
    label: "카드",
    match: (pathname) => pathname.startsWith("/connect/card"),
  },
  {
    href: "/connect/bank",
    label: "송금",
    match: (pathname) => pathname.startsWith("/connect/bank"),
  },
  {
    href: "/connect/ci",
    label: "CI",
    match: (pathname) => pathname.startsWith("/connect/ci"),
  },
  {
    href: "/connect/domain",
    label: "도메인",
    match: (pathname) => pathname.startsWith("/connect/domain"),
  },
  {
    href: "/connect/origin",
    label: "Origin",
    match: (pathname) => pathname.startsWith("/connect/origin"),
  },
];

export function isWorkSurface(pathname: string) {
  return (
    pathname.startsWith("/connect") ||
    pathname.startsWith("/oauth2") ||
    pathname.startsWith("/redirect") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/find-account")
  );
}

export function workAddress(pathname: string, search = "") {
  const cleaned = search.replace(/[?&]popup=1/g, "").replace(/^&/, "?");
  const query = cleaned === "?" ? "" : cleaned;
  return `${IN_APP_BROWSER_ORIGIN}${pathname}${query}`;
}
