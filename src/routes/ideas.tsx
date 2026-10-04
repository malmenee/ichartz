import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getTradeIdeas } from "@/lib/ideas.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Loader2,
  Crown,
  Clock,
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Newspaper,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const searchSchema = z.object({
  prediction: z.string().uuid().optional(),
});

export const Route = createFileRoute("/ideas")({
  head: () => ({ meta: [
    { title: "Trade Ideas — iChart" },
    { name: "description", content: "Review chart-based trade ideas and market context in iChart." },
    { property: "og:title", content: "Trade Ideas — iChart" },
    { property: "og:description", content: "Review chart-based trade ideas and market context in iChart." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  validateSearch: searchSchema,
  component: IdeasPage,
});

type Prediction = Tables<"predictions">;

type Plan = {
  asset: string;
  aligned_with_prior_bias?: boolean;
  session_bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  key_levels: { label: string; price: string }[];
  timeframe_focus?: { timeframe: string; role: string; note: string }[];
  best_windows: { time_utc: string; session: string; why: string }[];
  what_to_look_for: string[];
  trade_ideas: {
    direction: "LONG" | "SHORT";
    entry_zone: string;
    invalidation: string;
    targets: string[];
    confidence: number;
    rationale: string;
  }[];
  news_watch: {
    time_utc: string;
    event: string;
    impact: string;
    playbook: string;
  }[];
  risk_notes: string;
};

function IdeasPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const run = useServerFn(getTradeIdeas);

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    search.prediction ?? null,
  );
  const [style, setStyle] = useState<"scalp" | "intraday" | "swing">("intraday");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [newsCount, setNewsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) toast.error(error.message);
      else {
        setPredictions(data ?? []);
        if (!selectedId && data && data[0]) setSelectedId(data[0].id);
      }
    })();
  }, [user]);

  const selected = predictions.find((p) => p.id === selectedId) ?? null;

  const generate = async () => {
    if (!selectedId) {
      toast.error("Pick a chart analysis first.");
      return;
    }
    setBusy(true);
    setPlan(null);
    try {
      const res = await run({
        data: { predictionId: selectedId, style },
      });
      if (res.error || !res.result) {
        toast.error(res.error || "Failed to generate");
        return;
      }
      setPlan(res.result as Plan);
      setNewsCount(res.newsCount ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const biasColor =
    plan?.session_bias === "BULLISH"
      ? "text-chart-2"
      : plan?.session_bias === "BEARISH"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <LineChart className="h-5 w-5 text-primary" />
            ChartSeer
          </Link>
          <Link to="/app">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to analysis
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <h1 className="text-2xl font-bold">Premium — Daily Trade Ideas</h1>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Trade ideas are built from a chart analysis you've already run. Pick
          one below to get a day-plan for that asset & timeframes, with
          red-folder news factored in.
        </p>

        {predictions.length === 0 ? (
          <Card className="p-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-3 font-semibold">No chart analysis yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload charts and run an analysis first — trade ideas are built on
              top of that.
            </p>
            <Link to="/app" className="mt-4 inline-block">
              <Button className="gap-2">
                <Upload className="h-4 w-4" /> Go upload charts
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6">
            <Label>Base this plan on your chart analysis</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {predictions.map((p) => {
                const isSel = p.id === selectedId;
                const imgs =
                  (p.images as { timeframe: string }[] | null) ?? [];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                      isSel
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="font-semibold">
                      {p.asset ?? "Unknown"}{" "}
                      <span className="text-muted-foreground">
                        · {p.prediction_long ?? p.prediction ?? "?"}
                      </span>
                    </div>
                    <div className="mt-0.5 text-muted-foreground">
                      {imgs.map((i) => i.timeframe).join(" · ") || "—"}
                      {" · "}
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <Label>Style</Label>
                <div className="mt-2 flex gap-1">
                  {(["scalp", "intraday", "swing"] as const).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      size="sm"
                      variant={style === s ? "default" : "outline"}
                      onClick={() => setStyle(s)}
                      className="capitalize"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                onClick={generate}
                disabled={busy || !selectedId}
                className="gap-2"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Building plan...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" /> Generate day-plan
                  </>
                )}
              </Button>
            </div>

            {selected && (
              <p className="mt-3 text-xs text-muted-foreground">
                Using analysis for{" "}
                <span className="font-semibold">
                  {selected.asset ?? "Unknown"}
                </span>{" "}
                — long-term {selected.prediction_long ?? selected.prediction} (
                {selected.confidence_long ?? selected.confidence}%), short-term{" "}
                {selected.prediction_short} ({selected.confidence_short}%).
              </p>
            )}
            {newsCount !== null && (
              <p className="mt-1 text-xs text-muted-foreground">
                Considered {newsCount} red-folder event
                {newsCount === 1 ? "" : "s"} from the next 48h.
              </p>
            )}
          </Card>
        )}

        {plan && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.asset}</h2>
                <Badge variant="outline" className={biasColor}>
                  {plan.session_bias}
                </Badge>
              </div>
              {plan.aligned_with_prior_bias === false && (
                <p className="mt-2 text-xs text-yellow-500">
                  ⚠ Diverges from your prior chart bias — see rationale below.
                </p>
              )}
              <h3 className="mt-4 text-sm font-semibold text-muted-foreground">
                Key levels
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {plan.key_levels?.map((k, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{k.label}</span>
                    <span className="font-mono">{k.price}</span>
                  </li>
                ))}
              </ul>

              {plan.timeframe_focus && plan.timeframe_focus.length > 0 && (
                <>
                  <h3 className="mt-4 text-sm font-semibold text-muted-foreground">
                    Timeframe focus
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs">
                    {plan.timeframe_focus.map((t, i) => (
                      <li key={i}>
                        <Badge variant="secondary" className="mr-2 text-[10px]">
                          {t.timeframe}
                        </Badge>
                        <span className="text-muted-foreground">
                          {t.role}:
                        </span>{" "}
                        {t.note}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4" /> Best windows (UTC)
              </h3>
              <div className="mt-3 space-y-3">
                {plan.best_windows?.map((w, i) => (
                  <div
                    key={i}
                    className="rounded border border-border/60 bg-background/40 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {w.time_utc}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {w.session}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{w.why}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4" /> What to look for today
              </h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                {plan.what_to_look_for?.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h3 className="text-sm font-semibold">Trade ideas</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {plan.trade_ideas?.map((t, i) => {
                  const Icon =
                    t.direction === "LONG" ? TrendingUp : TrendingDown;
                  const color =
                    t.direction === "LONG"
                      ? "text-chart-2"
                      : "text-destructive";
                  return (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-card/40 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${color}`} />
                          <span className={`font-semibold ${color}`}>
                            {t.direction}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {t.confidence}%
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Entry</div>
                          <div className="font-mono">{t.entry_zone}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">
                            Invalidation
                          </div>
                          <div className="font-mono">{t.invalidation}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground">Targets</div>
                          <div className="font-mono">
                            {t.targets?.join(" → ")}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t.rationale}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Newspaper className="h-4 w-4" /> Red-folder news to watch
              </h3>
              {plan.news_watch?.length ? (
                <div className="mt-3 space-y-2">
                  {plan.news_watch.map((n, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-1 rounded border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="destructive"
                          className="font-mono text-xs"
                        >
                          {n.time_utc}
                        </Badge>
                        <span className="text-sm font-medium">{n.event}</span>
                      </div>
                      <span className="text-xs text-muted-foreground sm:max-w-[60%] sm:text-right">
                        {n.playbook}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No relevant red-folder events in the next 48h.
                </p>
              )}
            </Card>

            {plan.risk_notes && (
              <Card className="border-yellow-500/30 bg-yellow-500/5 p-6 lg:col-span-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" /> Risk
                  notes
                </h3>
                <p className="mt-2 text-sm">{plan.risk_notes}</p>
              </Card>
            )}
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-8">
        <p className="text-xs text-muted-foreground">
          <strong className="font-semibold">Disclaimer:</strong> ChartSeer is for
          educational and informational purposes only. It is not financial advice
          and should not be relied upon as a basis for any investment or trading
          decision. Markets carry substantial risk of loss. Always do your own
          research and consult a licensed financial advisor before acting.
        </p>
      </footer>
    </div>
  );
}
