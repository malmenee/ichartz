import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Coins, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ICT Pulse & ChartSeer credits" },
      { name: "description", content: "ICT Pulse subscription at $9/month and one-time ChartSeer credit packs of 10, 30 or 100 credits." },
      { property: "og:title", content: "Pricing — ICT Pulse & ChartSeer credits" },
      { property: "og:description", content: "Subscribe to the full ICT Pulse guide or top up ChartSeer analysis credits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PricingPage,
});

const PACKS = [
  { credits: 10, note: "Try a few setups" },
  { credits: 30, note: "A month of regular use" },
  { credits: 100, note: "Heavy daily use" },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-semibold">iChart</Link>
          <Link to="/dashboard"><Button size="sm" variant="ghost">Workspace</Button></Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every account starts with 2 free credits. One chart analysis or one trade idea uses 1 credit.
        </p>
        <p role="status" className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Checkout is not open yet. Payments will be switched on soon.
        </p>

        <section className="mt-10 rounded-xl border border-primary/40 bg-primary/5 p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-primary"><Radio className="size-4" /> Subscription</p>
          <h2 className="mt-2 text-2xl font-semibold">ICT Pulse <span className="text-base font-normal text-muted-foreground">$9 / month</span></h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["Full weekly and daily maps", "USD news playbook", "Seasonal notes and vocabulary", "Cancel anytime"].map((f) => (
              <li key={f} className="flex gap-2"><Check className="size-4 text-primary" /> {f}</li>
            ))}
          </ul>
          <Button className="mt-6" disabled>Subscribe — coming soon</Button>
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Coins className="size-5 text-primary" /> Credit packs</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {PACKS.map((p) => (
              <div key={p.credits} className="rounded-xl border border-border bg-card p-5">
                <p className="text-3xl font-bold">{p.credits}</p>
                <p className="text-sm text-muted-foreground">credits · {p.note}</p>
                <Button className="mt-4 w-full" variant="outline" disabled>Coming soon</Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
