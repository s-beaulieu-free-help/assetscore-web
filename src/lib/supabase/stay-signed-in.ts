export const STAY_SIGNED_IN_COOKIE = "assetscore-stay-signed-in";

const PERSISTENT_MAX_AGE = 400 * 24 * 60 * 60;

type SessionCookie = {
  name: string;
  value: string;
  options?: {
    maxAge?: number;
    expires?: Date;
  };
};

export function wantsStaySignedIn(cookies: { name: string; value: string }[]) {
  return cookies.some((cookie) => cookie.name === STAY_SIGNED_IN_COOKIE && cookie.value === "1");
}

export function withSessionLifetime<T extends SessionCookie>(cookiesToSet: T[], staySignedIn: boolean): T[] {
  if (staySignedIn) return cookiesToSet;
  return cookiesToSet.map((cookie) => {
    if (!cookie.options || cookie.options.maxAge === 0) return cookie;
    const { maxAge: _maxAge, expires: _expires, ...options } = cookie.options;
    return { ...cookie, options };
  });
}

export function rememberStaySignedIn(stay: boolean) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (stay) {
    document.cookie = `${STAY_SIGNED_IN_COOKIE}=1; Path=/; Max-Age=${PERSISTENT_MAX_AGE}; SameSite=Lax${secure}`;
    return;
  }
  document.cookie = `${STAY_SIGNED_IN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
