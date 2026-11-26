import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function AuthScreen({
  kicker,
  title,
  copy,
  points,
  children,
}: {
  kicker: string;
  title: string;
  copy: string;
  points?: string[];
  children: ReactNode;
}) {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-16">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">{kicker}</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em]">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted">{copy}</p>
        {points?.length ? (
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : null}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
