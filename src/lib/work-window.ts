export type WorkWindowSize = {
  width: number;
  height: number;
  left?: number;
  top?: number;
};

export function workWindowUrl(path: string) {
  if (typeof window === "undefined") return path;
  const url = new URL(path, window.location.origin);
  url.searchParams.set("popup", "1");
  return url.toString();
}

/** 로그인·연결 화면을 사용자가 직접 보고 작업할 수 있는 창으로 엽니다. */
export function openWorkWindow(
  path: string,
  target: string,
  size: WorkWindowSize = { width: 560, height: 760 },
) {
  const url = workWindowUrl(path);
  const left = size.left ?? Math.max(40, window.screenX + 48);
  const top = size.top ?? Math.max(24, window.screenY + 48);
  const features = [
    "popup=yes",
    `width=${size.width}`,
    `height=${size.height}`,
    `left=${left}`,
    `top=${top}`,
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
  const win = window.open(url, target, features);
  if (!win) {
    window.location.assign(url);
    return null;
  }
  win.focus();
  return win;
}

export function openExternalWindow(
  href: string,
  target: string,
  size: WorkWindowSize = { width: 920, height: 800 },
) {
  const left = size.left ?? Math.max(40, window.screenX + 80);
  const top = size.top ?? Math.max(24, window.screenY + 40);
  const features = [
    "popup=yes",
    `width=${size.width}`,
    `height=${size.height}`,
    `left=${left}`,
    `top=${top}`,
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
  const win = window.open(href, target, features);
  if (!win) return null;
  win.focus();
  return win;
}
