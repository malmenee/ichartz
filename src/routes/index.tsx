import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LineChart, Radio, Sparkles, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, oklch(0.55 0.18 250 / 0.4), transparent 70%), radial-gradient(40% 40% at 90% 30%, oklch(0.6 0.2 160 / 0.3), transparent 70%)",
        }}
      />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          iChart
        </div>
        {user ? (
          <Link to="/app">
            <Button variant="outline" size="sm">
              Go to dashboard
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

      <main className="mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" />
          Two tools. One account.
        </div>
        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
          Trading tools built on
          <br />
          <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            real price action.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          iChart is home to ChartSeer and ICT Pulse — one account, two ways to trade
          with more context and less guesswork.
        </p>

        <div className="mx-auto mt-16 grid max-w-3xl gap-6 text-left sm:grid-cols-2">
          <Link
            to="/app"
            className="group rounded-2xl border border-border bg-card/40 p-7 backdrop-blur transition hover:border-primary/50"
          >
            <LineChart className="h-6 w-6 text-primary" />
            <div className="mt-4 text-xl font-semibold">ChartSeer</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload a chart screenshot and get a multi-timeframe price-action read —
              structure, key levels, and a verified-accuracy track record that
              improves as more people use it.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open ChartSeer <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/pulse"
            className="group rounded-2xl border border-border bg-card/40 p-7 backdrop-blur transition hover:border-primary/50"
          >
            <Radio className="h-6 w-6 text-primary" />
            <div className="mt-4 text-xl font-semibold">ICT Pulse</div>
            <p className="mt-2 text-sm text-muted-foreground">
              A live read on the session you're in right now — the active kill zone,
              what to focus on, and upcoming red-folder news, updating in real time.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open ICT Pulse <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        <div className="mt-10">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
