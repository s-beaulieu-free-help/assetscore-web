"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-[15px] text-foreground outline-none placeholder:text-muted/70 focus:border-white/20";

function authMessage(message: string) {
  if (/invalid login credentials/i.test(message)) return "That email and password do not match.";
  if (/email not confirmed/i.test(message)) {
    return "Confirm your email before logging in. The verification message is in your inbox.";
  }
  if (/already registered|already been registered/i.test(message)) {
    return "An account with that email already exists.";
  }
  if (/abort|timeout/i.test(message)) {
    return "The request timed out. Check your connection and try again.";
  }
  if (/subtle|crypto/i.test(message)) {
    return "Open this site at localhost or https. The browser cannot create an account from an insecure address.";
  }
  return message;
}

async function runAuth(setPending: (value: boolean) => void, setMessage: (value: string) => void, task: () => Promise<void>) {
  setPending(true);
  setMessage("");
  try {
    await task();
  } catch (error) {
    setMessage(authMessage(error instanceof Error ? error.message : "Something went wrong. Try again."));
  } finally {
    setPending(false);
  }
}

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    await runAuth(setPending, setMessage, async () => {
      const { error } = await createSupabaseBrowser().auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(authMessage(error.message));
        return;
      }
      router.push("/account");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm text-muted">
        Email
        <input name="email" type="email" autoComplete="email" required className={`${inputClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={`${inputClass} mt-2`} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Log in"}
      </button>
      <p aria-live="polite" className="min-h-5 text-[13px] leading-5 text-[#f0a3a8]">
        {message}
      </p>
      <p className="text-sm text-muted">
        <Link href="/forgot-password" className="hover:text-foreground">
          Forgot your password?
        </Link>
      </p>
      <p className="text-sm text-muted">
        No account yet?{" "}
        <Link href="/register" className="text-foreground hover:text-accent">
          Register
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (displayName.length < 2 || displayName.length > 40) {
      setMessage("Choose a display name between 2 and 40 characters.");
      return;
    }
    if (password.length < 8) {
      setMessage("Use a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("The passwords do not match.");
      return;
    }

    await runAuth(setPending, setMessage, async () => {
      const redirectTo = `${window.location.origin}/auth/callback?next=/account`;
      const { data, error } = await createSupabaseBrowser().auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName }, emailRedirectTo: redirectTo },
      });
      if (error) {
        setMessage(authMessage(error.message));
        return;
      }
      if (data.session) {
        window.location.assign("/account");
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <p className="mt-8 text-sm leading-6 text-muted">
        Check your inbox and confirm the email address. After that, you can log in. Your display name is saved with the account.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm text-muted">
        Display name
        <input name="displayName" autoComplete="nickname" required className={`${inputClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Email
        <input name="email" type="email" autoComplete="email" required className={`${inputClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Password
        <input name="password" type="password" autoComplete="new-password" required className={`${inputClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Confirm password
        <input name="confirm" type="password" autoComplete="new-password" required className={`${inputClass} mt-2`} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p aria-live="polite" className="min-h-5 text-[13px] leading-5 text-[#f0a3a8]">
        {message}
      </p>
      <p className="text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="text-foreground hover:text-accent">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    await runAuth(setPending, setMessage, async () => {
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error } = await createSupabaseBrowser().auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setMessage(authMessage(error.message));
        return;
      }
      setMessage("If an account exists for that email, a reset message is on its way.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm text-muted">
        Email
        <input name="email" type="email" autoComplete="email" required className={`${inputClass} mt-2`} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p aria-live="polite" className="min-h-5 text-[13px] leading-5 text-muted">
        {message}
      </p>
      <p className="text-sm text-muted">
        <Link href="/login" className="hover:text-foreground">
          Back to log in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8) {
      setMessage("Use a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("The passwords do not match.");
      return;
    }
    await runAuth(setPending, setMessage, async () => {
      const { error } = await createSupabaseBrowser().auth.updateUser({ password });
      if (error) {
        setMessage(authMessage(error.message));
        return;
      }
      router.push("/account");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm text-muted">
        New password
        <input name="password" type="password" autoComplete="new-password" required className={`${inputClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Confirm password
        <input name="confirm" type="password" autoComplete="new-password" required className={`${inputClass} mt-2`} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-medium text-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save password"}
      </button>
      <p aria-live="polite" className="min-h-5 text-[13px] leading-5 text-[#f0a3a8]">
        {message}
      </p>
    </form>
  );
}
