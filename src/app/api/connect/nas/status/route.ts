import { createConnection } from "node:net";
import { ipv4Kind } from "@/lib/nas";

export const dynamic = "force-dynamic";

type Probe = {
  port: number;
  open: boolean;
  detail: string;
};

function probeTcp(host: string, port: number, timeoutMs = 3500): Promise<Probe> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const finish = (open: boolean, detail: string) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve({ port, open, detail });
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true, "연결됨"));
    socket.once("timeout", () => finish(false, "시간 초과"));
    socket.once("error", (error) => finish(false, error.message));
  });
}

export async function GET(request: Request) {
  const ipv4 = new URL(request.url).searchParams.get("ipv4")?.trim() ?? "";
  if (!ipv4) {
    return Response.json({
      ready: false,
      message: "회사 공인 IPv4를 넣으면 밖에서 80·443이 열리는지 이 서버에서 확인합니다.",
      probes: [] as Probe[],
    });
  }

  const kind = ipv4Kind(ipv4);
  if (kind !== "public") {
    return Response.json({
      ready: false,
      ipv4,
      kind,
      message:
        kind === "cgnat"
          ? "100.64–127 대역은 통신사 공유 IP(CGNAT)입니다. 가비아 A에 넣어도 사이트가 열리지 않습니다."
          : kind === "private"
            ? "사설 IP입니다. 공유기 WAN의 공인 IPv4를 넣어야 합니다."
            : "IPv4 형식이 아닙니다.",
      probes: [] as Probe[],
    });
  }

  const probes = await Promise.all([probeTcp(ipv4, 80), probeTcp(ipv4, 443), probeTcp(ipv4, 5001)]);
  const httpOpen = probes.find((item) => item.port === 80)?.open;
  const httpsOpen = probes.find((item) => item.port === 443)?.open;
  const dsmOpen = probes.find((item) => item.port === 5001)?.open;

  let message = "밖에서 80·443이 아직 닫혀 있습니다. 공유기 포트포워드를 먼저 넣으세요.";
  if (httpOpen && httpsOpen) {
    message = "밖에서 80·443이 열립니다. 가비아 A에 이 IP를 넣고 시놀로지에서 인증서·프록시를 마치면 됩니다.";
  } else if (httpOpen) {
    message = "80은 열리고 443은 닫혀 있습니다. 공유기에서 443 → NAS:443 을 추가하세요.";
  } else if (httpsOpen) {
    message = "443은 열리고 80은 닫혀 있습니다. Let's Encrypt 발급을 위해 80도 열어 주세요.";
  }

  if (dsmOpen) {
    message += " DSM 5001이 인터넷에 열려 있습니다. 보안을 위해 공유기에서 5000·5001 포워드는 끄세요.";
  }

  return Response.json({
    ready: Boolean(httpOpen && httpsOpen),
    ipv4,
    kind,
    message,
    probes,
  });
}
