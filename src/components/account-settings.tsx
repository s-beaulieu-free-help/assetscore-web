"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-[15px] outline-none focus:border-white/20";

export function AccountSettings({
  userId,
  email,
  displayName,
  language,
}: {
  userId: string;
  email: string;
  displayName: string;
  language: string;
}) {
  const router = useRouter();
  const [profileMessage, setProfileMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("displayName") ?? "").trim();
    const preferred = String(form.get("language") ?? "en");
    if (name.length < 2 || name.length > 40) {
      setProfileMessage("Choose a display name between 2 and 40 characters.");
      return;
    }
    const supabase = createSupabaseBrowser();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name, preferred_language: preferred })
      .eq("id", userId);
    if (error) {
      setProfileMessage(error.message);
      return;
    }
    await supabase.auth.updateUser({ data: { display_name: name } });
    setProfileMessage("Profile saved.");
    router.refresh();
  }

  async function saveEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const { error } = await createSupabaseBrowser().auth.updateUser({ email: nextEmail });
    setEmailMessage(error ? error.message : "Check both the old and new inbox to confirm the email change.");
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8) {
      setPasswordMessage("Use a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setPasswordMessage("The passwords do not match.");
      return;
    }
    const { error } = await createSupabaseBrowser().auth.updateUser({ password });
    setPasswordMessage(error ? error.message : "Password updated.");
    if (!error) event.currentTarget.reset();
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your account, portfolios, favorites, and reviews? This cannot be undone.")) return;
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setDeleteMessage(error.message);
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-medium">Profile</h2>
        <label className="mt-4 block text-sm text-muted">
          Display name
          <input name="displayName" defaultValue={displayName} className={inputClass} />
        </label>
        <label className="mt-4 block text-sm text-muted">
          Preferred language
          <select name="language" defaultValue={language === "fr" ? "fr" : "en"} className={inputClass}>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>
        <button type="submit" className="mt-4 h-11 rounded-full bg-accent px-5 text-sm font-medium text-ink">
          Save profile
        </button>
        <p className="mt-3 min-h-5 text-[13px] text-muted">{profileMessage}</p>
      </form>

      <form onSubmit={saveEmail} className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-medium">Email</h2>
        <p className="mt-2 text-sm text-muted">Current email: {email}</p>
        <label className="mt-4 block text-sm text-muted">
          New email
          <input name="email" type="email" required className={inputClass} />
        </label>
        <button type="submit" className="mt-4 h-11 rounded-full border border-line px-5 text-sm">
          Update email
        </button>
        <p className="mt-3 min-h-5 text-[13px] text-muted">{emailMessage}</p>
      </form>

      <form onSubmit={savePassword} className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-medium">Password</h2>
        <label className="mt-4 block text-sm text-muted">
          New password
          <input name="password" type="password" autoComplete="new-password" required className={inputClass} />
        </label>
        <label className="mt-4 block text-sm text-muted">
          Confirm password
          <input name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
        </label>
        <button type="submit" className="mt-4 h-11 rounded-full border border-line px-5 text-sm">
          Update password
        </button>
        <p className="mt-3 min-h-5 text-[13px] text-muted">{passwordMessage}</p>
      </form>

      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-medium">Delete account</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          This removes your profile, portfolios, favorite stocks, and reviews.
        </p>
        <button type="button" onClick={deleteAccount} className="mt-4 h-11 rounded-full bg-[#f0a3a8] px-5 text-sm font-medium text-ink">
          Delete account
        </button>
        <p className="mt-3 min-h-5 text-[13px] text-[#f0a3a8]">{deleteMessage}</p>
      </section>
    </div>
  );
}
