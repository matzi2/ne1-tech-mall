export type GabiaPublicState = {
  status: "idle" | "login" | "ready" | "applied" | "error";
  userId: string | null;
  captchaSrc: string | null;
  message: string | null;
  applied: string[];
};
