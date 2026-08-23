import { gabiaCaptchaImage } from "@/lib/gabia-connect";

export const dynamic = "force-dynamic";

export async function GET() {
  const image = await gabiaCaptchaImage();
  if (!image) return new Response("captcha unavailable", { status: 404 });
  return new Response(image.bytes, {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": "no-store",
    },
  });
}
