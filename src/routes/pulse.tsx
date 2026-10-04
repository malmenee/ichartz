import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { getPulse } from "@/lib/pulse.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Clock,
  Calendar,
  TrendingUp,
  Newspaper,
  Loader2,
  ArrowLeft,
  Radio,
} from "lucide-react";

export const Route = createFileRoute("/pulse")({
  component: PulsePage,
});

type KillZone = {
  id: string;
  name: string;
  startHourET: number;
  startMinET: number;
  endHourET: number;
  endMinET: number;
  summary: string;
  focus: string;
};
type DayFocus = { day: number; name: string; summary: string; focus: string };
type FFEvent = {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast?: string;
  previous?: string;
};
type PulseData = {
  serverTimeUtc: string;
  activeKillZone: KillZone | null;
  allKillZones: KillZone[];
  dayFocus: DayFocus | null;
  allDays: DayFocus[];
  seasonal: { title: string; summary: string };
  quarter: { quarter: number; year: number; percentThroughQuarter: number };
  newsPhilosophy: { title: string; points: string[] };
  upcomingNews: FFEvent[];
};

function fmtET(d: Date) {
  return d.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PulsePage() {
  const { user } = useAuth();
  const fetchPulse = useServerFn(getPulse);
  const [data, setData] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState(new Date());

  const load = useCallback(() => {
    fetchPulse()
      .then((d) => setData(d as PulseData))
      .finally(() => setLoading(false));
  }, [fetchPulse]);

  useEffect(() => {
    load();
    const refresh = setInterval(load, 5 * 60 * 1000); // re-pull news/zone every 5 min
    const tick = setInterval(() => setClock(new Date()), 1000); // live clock
    return () => {
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, [load]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Radio className="h-5 w-5 text-primary" />
            ICT Pulse
          </Link>
          {user ? (
            <Link to="/app">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> ChartSeer
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Right now</h1>
            <p className="text-sm text-muted-foreground">
              {fmtET(clock)} ET · updates live
            </p>
          </div>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>

        {/* Section 1: Seasonal / day / time-of-day */}
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Session &amp; timing</h2>
          </div>

          {data?.activeKillZone ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{data.activeKillZone.name}</span>
                <Badge className="text-[10px]">Active now</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{data.activeKillZone.summary}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Between defined windows right now.</p>
          )}

          {data?.dayFocus && (
            <div className="mt-3 flex items-start gap-2 border-t border-border pt-3">
              <Calendar className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">{data.dayFocus.name}</span>
                <p className="text-sm text-muted-foreground">{data.dayFocus.summary}</p>
              </div>
            </div>
          )}

          {data?.seasonal && (
            <div className="mt-3 flex items-start gap-2 border-t border-border pt-3">
              <TrendingUp className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">
                  {data.seasonal.title}
                  {data.quarter && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Q{data.quarter.quarter} {data.quarter.year} ·{" "}
                      {data.quarter.percentThroughQuarter}% through
                    </span>
                  )}
                </span>
                <p className="text-sm text-muted-foreground">{data.seasonal.summary}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Section 2: What to focus on right now */}
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">What to focus on right now</h2>
          </div>
          <p className="text-sm">
            {data?.activeKillZone?.focus ??
              "No specific high-attention window is active — a reasonable time to review structure rather than force a new entry."}
          </p>
          {data?.dayFocus && (
            <p className="mt-2 text-sm text-muted-foreground">{data.dayFocus.focus}</p>
          )}
        </Card>

        {/* Section 3: Red-folder news */}
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Red-folder news</h2>
          </div>

          {data?.upcomingNews && data.upcomingNews.length > 0 ? (
            <div className="space-y-2">
              {data.upcomingNews.slice(0, 8).map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{e.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{e.country}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(e.date).toLocaleString("en-US", {
                      timeZone: "America/New_York",
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    ET
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No high-impact events in the next 72 hours.
            </p>
          )}

          {data?.newsPhilosophy && (
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <span className="text-sm font-medium">{data.newsPhilosophy.title}</span>
              <ul className="space-y-1.5">
                {data.newsPhilosophy.points.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">·</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Educational market-timing context, not financial advice.
        </p>
      </main>
    </div>
  );
}
