"use client";

import { FormEvent, useState } from "react";

const inputClass =
  "mt-2 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-foreground outline-none focus:border-white/20";

export function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          company: String(form.get("company") ?? ""),
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; ok?: boolean } | null;
      if (!response.ok || !payload?.ok) {
        setNotice(payload?.message || "The message could not be sent. Try again in a moment.");
        setPending(false);
        return;
      }
      setEmail("");
      setMessage("");
      setNotice("Your message was sent.");
    } catch {
      setNotice("The message could not be sent. Try again in a moment.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-xl">
      <label className="block text-sm text-muted">
        Email address
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${inputClass} h-11`}
        />
      </label>
      <label className="mt-4 block text-sm text-muted">
        Message
        <textarea
          name="message"
          required
          rows={6}
          maxLength={5000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`${inputClass} py-3`}
        />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
      {notice ? <p className="mt-4 text-sm text-foreground">{notice}</p> : null}
    </form>
  );
}
