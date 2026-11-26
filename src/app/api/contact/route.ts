import { NextResponse } from "next/server";
import { sendContactMessage, validContactEmail } from "@/lib/contact";

export async function POST(request: Request) {
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
