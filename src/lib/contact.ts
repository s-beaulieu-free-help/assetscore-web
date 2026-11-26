const RECIPIENT = "mail.sylvain.beaulieu@gmail.com";

export function validContactEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

export async function sendContactMessage(from: string, message: string) {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(RECIPIENT)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: "https://assetscore.net",
      Referer: "https://assetscore.net/about",
    },
    body: JSON.stringify({
      email: from,
      message,
      _subject: "AssetScore contact",
      _template: "table",
      _captcha: "false",
    }),
  });
  const text = await response.text();
  if (!response.ok) return false;
  try {
    const payload = JSON.parse(text) as { success?: string | boolean };
    return payload.success === true || payload.success === "true";
  } catch {
    return false;
  }
}
