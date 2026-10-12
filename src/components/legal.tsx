import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const CONTACT_EMAIL = "malmenee.1@gmail.com";
export const RISK_SHORT =
  "Educational only, not financial advice. Trading involves substantial risk of loss. AI analysis can be wrong; past results do not guarantee future performance.";

export function RiskNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-muted-foreground ${className}`}>
      {RISK_SHORT} <Link to="/risk" className="underline underline-offset-2 hover:text-foreground">Read the full risk disclosure</Link>.
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} iChart · Educational tools, not financial advice.</p>
        <nav className="flex flex-wrap gap-4">
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/risk" className="hover:text-foreground">Risk disclosure</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">{CONTACT_EMAIL}</a>
        </nav>
      </div>
    </footer>
  );
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-semibold">iChart</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated {updated}</p>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground">
          {children}
        </div>
      </main>
    </div>
  );
}

export function legalHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — iChart` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — iChart` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
