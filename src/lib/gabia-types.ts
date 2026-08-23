export type GabiaLastAction =
  | "idle"
  | "login"
  | "sms_sent"
  | "email_sent"
  | "verify_ok"
  | "verify_fail"
  | "dns_ok"
  | "dns_fail";

export type GabiaPublicState = {
  status: "idle" | "login" | "foreign" | "ready" | "applied" | "error";
  userId: string | null;
  captchaSrc: string | null;
  message: string | null;
  applied: string[];
  foreignChannel: "sms" | "ems" | null;
  phoneMasked: string | null;
  emailMasked: string | null;
  lastAction: GabiaLastAction;
  hasForeignToken: boolean;
  sendCount: number;
  lastCheckedAt: string | null;
};
