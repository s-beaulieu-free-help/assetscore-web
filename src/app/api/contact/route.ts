import { NextResponse } from "next/server";
import { sendContactMessage, validContactEmail } from "@/lib/contact";
import { tooManyRequests } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooManyRequests(`contact:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ message: "Too many messages. Try again in a few minutes." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { email?: string; message?: string; company?: string } | null;
  if (body?.company) return NextResponse.json({ ok: true });

  const email = body?.email?.trim() ?? "";
  const message = body?.message?.trim() ?? "";
  if (!validContactEmail(email) || message.length < 1 || message.length > 5000) {
    return NextResponse.json({ message: "Enter a valid email address and a message." }, { status: 400 });
  }

  const sent = await sendContactMessage(email, message).catch(() => false);
  if (!sent) {
    return NextResponse.json({ message: "The message could not be sent. Try again in a moment." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
