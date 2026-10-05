import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LineChart, Radio, Sparkles, ArrowRight, BarChart3, ShieldCheck, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "iChart — ChartSeer & ICT Pulse" },
    { name: "description", content: "Explore ChartSeer chart analysis and ICT Pulse market timing in iChart." },
    { property: "og:title", content: "iChart — ChartSeer & ICT Pulse" },
    { property: "og:description", content: "Explore ChartSeer chart analysis and ICT Pulse market timing in iChart." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-35" />
      <header className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-2.5 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/25 bg-primary/10"><LineChart className="h-4 w-4 text-primary" /></span>
          iChart
        </div>
        {user ? (
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                My workspace <ArrowRight />
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-20">
        <section className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" /> Market intelligence, unified
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
              See the market.<br /><span className="text-primary">Build your plan.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">ChartSeer reads your price action. ICT Pulse keeps you aligned with timing and news. Every analysis and idea stays saved in your private workspace.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? "/dashboard" : "/auth"}><Button size="lg" className="h-12 gap-2 px-6">{user ? "Open workspace" : "Get started free"}<ArrowRight /></Button></Link>
              <Link to="/pulse"><Button size="lg" variant="outline" className="h-12 gap-2 px-6"><Radio /> View live Pulse</Button></Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-signal" /> Private by default</span><span className="flex items-center gap-2"><Activity className="h-4 w-4 text-signal" /> Live market context</span></div>
          </div>

          <div className="workspace-preview relative overflow-hidden rounded-lg border border-border bg-card/70 p-3 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border px-2 pb-3"><div className="flex items-center gap-2 text-xs font-medium"><BarChart3 className="h-4 w-4 text-primary" /> Today’s workspace</div><span className="font-mono text-[10px] uppercase tracking-widest text-signal">Live</span></div>
            <div className="grid gap-3 pt-3 sm:grid-cols-[1.2fr_.8fr]">
              <div className="rounded-md border border-border bg-background/55 p-4"><div className="flex items-center justify-between"><span className="text-sm font-medium">NAS100 · 15m</span><span className="text-xs text-signal">Bullish 78%</span></div><div className="mt-5 flex h-32 items-end gap-1.5">{[32,48,39,66,55,78,62,88,72,94,82,104].map((height, index) => <span key={index} className="chart-bar flex-1 rounded-sm bg-primary/25" style={{ height }} />)}</div><div className="mt-4 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground"><span>London open</span><span>NY AM</span></div></div>
              <div className="space-y-3"><div className="rounded-md border border-border bg-background/55 p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Current window</p><p className="mt-2 font-medium">New York AM</p><p className="mt-1 text-xs text-muted-foreground">Watch for liquidity delivery after the open.</p></div><div className="rounded-md border border-border bg-background/55 p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Saved playbook</p><p className="mt-2 text-2xl font-semibold">3 ideas</p><p className="mt-1 text-xs text-muted-foreground">Ready for review</p></div></div>
            </div>
          </div>
        </section>

        <section className="mt-24 border-t border-border pt-10">
          <div className="mb-7"><p className="text-xs uppercase tracking-widest text-muted-foreground">Two focused tools</p><h2 className="mt-2 text-2xl font-semibold">From chart to trade plan</h2></div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          <Link
            to="/app"
            className="group bg-card p-7 transition hover:bg-accent/60 sm:p-9"
          >
            <LineChart className="h-6 w-6 text-primary" /><div className="mt-8 text-2xl font-semibold">ChartSeer</div><p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">Upload charts across timeframes and turn raw price action into a structured directional read.</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Analyze a chart <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to="/pulse"
            className="group bg-card p-7 transition hover:bg-accent/60 sm:p-9"
          >
            <Radio className="h-6 w-6 text-signal" /><div className="mt-8 text-2xl font-semibold">ICT Pulse</div><p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">Stay oriented with the active session, time windows, weekly map, and high-impact news.</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Open live Pulse <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
