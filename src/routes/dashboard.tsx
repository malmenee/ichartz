import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  LineChart,
  Loader2,
  LogOut,
  Radio,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My workspace — iChart" },
      { name: "description", content: "Review your saved chart analyses and recent trade ideas in iChart." },
      { property: "og:title", content: "My workspace — iChart" },
      { property: "og:description", content: "Review your saved chart analyses and recent trade ideas in iChart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

type Prediction = Tables<"predictions">;
type SavedIdea = Tables<"trade_ideas">;

type IdeaPlan = {
  asset?: string;
  session_bias?: string;
  trade_ideas?: Array<{ direction?: string; entry_zone?: string; confidence?: number }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      supabase.from("predictions").select("*").order("created_at", { ascending: false }).limit(6),
      supabase.from("trade_ideas").select("*").order("created_at", { ascending: false }).limit(6),
    ]).then(([predictionResult, ideaResult]) => {
      if (!active) return;
      if (predictionResult.error || ideaResult.error) {
        toast.error(predictionResult.error?.message ?? ideaResult.error?.message ?? "Could not load your workspace");
      }
      setPredictions(predictionResult.data ?? []);
      setIdeas(ideaResult.data ?? []);
      setLoadingData(false);
    });
    return () => { active = false; };
  }, [user]);

  const uploadedCharts = useMemo(
    () => predictions.reduce((total, prediction) => {
      const images = prediction.images as Array<{ url?: string }> | null;
      return total + (images?.length ?? (prediction.image_url ? 1 : 0));
    }, 0),
    [predictions],
  );

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/25 bg-primary/10"><LineChart className="h-4 w-4 text-primary" /></span>
            iChart
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/dashboard"><Button size="sm" variant="secondary">Workspace</Button></Link>
            <Link to="/app"><Button size="sm" variant="ghost">ChartSeer</Button></Link>
            <Link to="/pulse"><Button size="sm" variant="ghost">ICT Pulse</Button></Link>
          </nav>
          <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="flex flex-col justify-between gap-6 border-b border-border pb-9 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-signal">Personal workspace</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Welcome back</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">Your latest chart reads and saved trade plans, ready where you left them.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/pulse"><Button variant="outline" className="gap-2"><Radio /> Live ICT Pulse</Button></Link>
            <Link to="/app"><Button className="gap-2"><Upload /> Upload charts</Button></Link>
          </div>
        </section>

        <section className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 mt-8">
          {[
            { label: "Saved analyses", value: predictions.length, icon: BarChart3 },
            { label: "Chart images", value: uploadedCharts, icon: Upload },
            { label: "Saved ideas", value: ideas.length, icon: Sparkles },
          ].map((stat) => (
            <div key={stat.label} className="bg-card px-5 py-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{stat.label}</span><stat.icon className="h-4 w-4" /></div>
              <div className="mt-3 text-3xl font-semibold tabular-nums">{loadingData ? "—" : stat.value}</div>
            </div>
          ))}
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Library</p><h2 className="mt-1 text-xl font-semibold">Recent chart uploads</h2></div>
              <Link to="/app" className="text-sm text-primary hover:text-primary/80">View all</Link>
            </div>
            {loadingData ? <LoadingRows /> : predictions.length === 0 ? (
              <EmptyState icon={Upload} title="No charts saved yet" text="Upload your first charts to start building your private analysis history." to="/app" action="Upload charts" />
            ) : (
              <div className="divide-y divide-border border-y border-border">
                {predictions.map((prediction) => {
                  const images = (prediction.images as Array<{ timeframe: string; url: string }> | null) ?? (prediction.image_url ? [{ timeframe: "Chart", url: prediction.image_url }] : []);
                  return (
                    <Link key={prediction.id} to="/ideas" search={{ prediction: prediction.id }} className="group grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4">
                      <div className="flex h-14 w-[72px] items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                        {images[0]?.url ? <img src={images[0].url} alt={`${prediction.asset ?? "Market"} chart`} className="h-full w-full object-cover" /> : <LineChart className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate font-medium">{prediction.asset ?? "Untitled market"}</span><Badge variant="outline" className="text-[10px]">{images.length} chart{images.length === 1 ? "" : "s"}</Badge></div><p className="mt-1 truncate text-sm text-muted-foreground">Long {prediction.prediction_long ?? prediction.prediction ?? "pending"} · Short {prediction.prediction_short ?? "pending"}</p></div>
                      <div className="hidden items-center gap-3 sm:flex"><span className="text-xs text-muted-foreground">{formatDate(prediction.created_at)}</span><ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" /></div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Playbook</p><h2 className="mt-1 text-xl font-semibold">Recent ideas</h2></div>
            {loadingData ? <LoadingRows /> : ideas.length === 0 ? (
              <EmptyState icon={Sparkles} title="No saved ideas yet" text="Generate a trade plan from any chart analysis and it will appear here." to="/ideas" action="Build an idea" />
            ) : (
              <div className="space-y-3">
                {ideas.map((idea) => {
                  const plan = idea.plan as IdeaPlan;
                  const first = plan.trade_ideas?.[0];
                  return (
                    <Link key={idea.id} to="/ideas" search={{ prediction: idea.prediction_id }} className="block rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-accent/40">
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="font-medium">{plan.asset ?? "Market plan"}</span><Badge variant="secondary" className="text-[10px] uppercase">{idea.style}</Badge></div><span className="font-mono text-xs text-muted-foreground">{formatDate(idea.created_at)}</span></div>
                      <div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">Session bias</p><p className="mt-1 text-lg font-semibold">{plan.session_bias ?? first?.direction ?? "Neutral"}</p></div>{first?.confidence !== undefined && <span className="text-sm text-signal">{first.confidence}% confidence</span>}</div>
                      {first?.entry_zone && <p className="mt-3 truncate border-t border-border pt-3 text-xs text-muted-foreground">Entry: <span className="text-foreground">{first.entry_zone}</span></p>}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function LoadingRows() {
  return <div className="flex h-40 items-center justify-center border-y border-border"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
}

function EmptyState({ icon: Icon, title, text, to, action }: { icon: typeof Upload; title: string; text: string; to: "/app" | "/ideas"; action: string }) {
  return <div className="border-y border-border py-10 text-center"><Icon className="mx-auto h-6 w-6 text-muted-foreground" /><h3 className="mt-3 font-medium">{title}</h3><p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{text}</p><Link to={to} className="mt-4 inline-block"><Button size="sm" variant="outline">{action}<ArrowRight /></Button></Link></div>;
}