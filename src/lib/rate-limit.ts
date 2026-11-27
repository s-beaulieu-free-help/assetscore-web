const hits = new Map<string, number[]>();

export function tooManyRequests(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  if (hits.size > 5000) {
    for (const [name, stamps] of hits) {
      const fresh = stamps.filter((at) => now - at < windowMs);
      if (fresh.length === 0) hits.delete(name);
      else hits.set(name, fresh);
    }
  }
  hits.set(key, recent);
  return false;
}
