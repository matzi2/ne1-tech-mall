export type GabiaPublicState = {
  status: "idle" | "login" | "foreign" | "ready" | "applied" | "error";
  userId: string | null;
  captchaSrc: string | null;
  message: string | null;
  applied: string[];
  foreignChannel: "sms" | "ems" | null;
  phoneMasked: string | null;
  emailMasked: string | null;
};
