import { IN_APP_BROWSER_HOME } from "@/lib/in-app-browser";

export type WorkWindowSize = {
  width: number;
  height: number;
  left?: number;
  top?: number;
};

export function workWindowUrl(path: string) {
  return path || IN_APP_BROWSER_HOME;
}

/** 팝업·숨은 창 없이, 지금 이 인앱 브라우저에서 이동합니다. */
export function openWorkWindow(path: string) {
  if (typeof window === "undefined") return null;
  window.location.assign(workWindowUrl(path));
  return null;
}

/** 바깥 사이트는 Preview를 깨므로 인앱 경로만 이동합니다. */
export function openExternalWindow(href: string) {
  if (typeof window === "undefined") return null;
  if (href.startsWith("/")) {
    window.location.assign(href);
  }
  return null;
}
