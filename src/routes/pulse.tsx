import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Activity, ArrowLeft, CalendarDays, CalendarRange, Check, Clock3, Info, Newspaper, Radio, RefreshCw, ShieldAlert, Timer, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getPulse } from "@/lib/pulse.functions";
import {
  CORRELATION, DAILY_RHYTHM, DAYS, NEWS_PLAYBOOK, SEASONS, SOURCE_NOTE, TIME_WINDOWS, VOCABULARY, WEEKLY_RHYTHM,
  buildRightNow, getDay, getETParts, getSeasonForMonth, getWindowForMinutes, isMarketClosed, matchNewsPlaybook,
  type GuideNewsEvent,
} from "@/lib/ict-guide";

type PulseNews = { events: GuideNewsEvent[]; fetchedAt: string | null; error: string | null; stale: boolean };

export const Route = createFileRoute("/pulse")({
  head: () => ({ meta: [
    { title: "ICT Pulse — iChart" },
    { name: "description", content: "A live Eastern Time trading-day guide with session windows, weekly and daily maps, high-impact news and ICT transcript notes." },
    { property: "og:title", content: "ICT Pulse — iChart" },
    { property: "og:description", content: "Explore today's market timing, economic calendar and transcript-based ICT field guide." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PulsePage,
});

const panel = "border-b border-border py-5";
const label = "flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground";
const muted = "text-sm leading-relaxed text-muted-foreground";

function Correlation({ corr }: { corr: { label: string; stars: string } }) {
  const tone = corr.label === "STRONG" ? "text-chart-2 border-chart-2/40" : corr.label === "MODERATE" ? "text-chart-4 border-chart-4/40" : "text-muted-foreground border-border";
  return <Badge variant="outline" className={`shrink-0 gap-1 text-[10px] ${tone}`} title={CORRELATION[corr.label as keyof typeof CORRELATION]?.note}>{corr.stars} {corr.label}</Badge>;
}

function PulsePage() {
  const fetchPulse = useServerFn(getPulse);
  const [clock, setClock] = useState<Date | null>(null);
  const [news, setNews] = useState<PulseNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);
  const load = useCallback(async () => {
    setLoading(true);
    try { setNews(await fetchPulse()); }
    catch (error) { setNews((previous) => ({ events: previous?.events ?? [], fetchedAt: previous?.fetchedAt ?? null, stale: !!previous, error: error instanceof Error ? error.message : "Calendar unavailable" })); }
    finally { setLoading(false); }
  }, [fetchPulse]);

  useEffect(() => {
    setClock(new Date());
    const tick = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, []);
  useEffect(() => {
    void load();
    const refresh = window.setInterval(() => void load(), 5 * 60 * 1000);
    return () => window.clearInterval(refresh);
  }, [load]);

  const et = useMemo(() => getETParts(clock ?? new Date(0)), [clock]);
  const windowNow = getWindowForMinutes(et.minutesOfDay);
  const day = getDay(et.weekdayKey);
  const season = getSeasonForMonth(et.month);
  const closed = isMarketClosed(et.weekdayKey, et.minutesOfDay);
  const events = news?.events ?? [];
  const guidance = buildRightNow({ etParts: et, window: windowNow, day, season, newsEvents: events, isClosed: closed });
  const nextWindow = TIME_WINDOWS[(TIME_WINDOWS.findIndex((w) => w.id === windowNow.id) + 1) % TIME_WINDOWS.length];
  const minutesUntil = (nextWindow.start - et.minutesOfDay + 1440) % 1440;
  const today = `${String(new Date(et.month + " 1, " + et.year).getMonth() + 1).padStart(2, "0")}-${String(et.day).padStart(2, "0")}-${et.year}`;
  const groups = events.reduce<Record<string, GuideNewsEvent[]>>((result, event) => {
    (result[event.date] ??= []).push(event);
    return result;
  }, {});

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-background/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold"><Radio className="size-5 text-primary" /> ICT Pulse</Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{clock ? `${et.weekday}, ${et.month} ${et.day} · ${et.clock} ET` : "Eastern Time"}</span>
          <Link to="/app"><Button size="sm" variant="outline"><ArrowLeft /> ChartSeer</Button></Link>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border py-7">
        <div><p className="text-xs font-medium uppercase text-muted-foreground">Trading day · New York time</p><h1 className="mt-1 text-3xl font-bold sm:text-4xl">Right now</h1><p className="mt-2 text-sm text-muted-foreground">{clock ? `${et.weekday}, ${et.month} ${et.day} · ${et.clock} ET` : "Loading clock…"}</p></div>
        <Badge variant="outline" className={closed ? "text-muted-foreground" : "border-chart-2/40 text-chart-2"}>{closed ? "Weekend · closed" : "Futures week · open"}</Badge>
      </div>
      {closed && <p className="flex gap-2 border-b border-border py-4 text-sm text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" /> Index futures are generally closed on weekends and reopen around 6:00 PM ET Sunday. Holiday hours may vary.</p>}

      <div className="grid gap-x-8 lg:grid-cols-3">
        <section className={panel}><div className={`${label} justify-between`}><span className="flex items-center gap-2"><CalendarDays className="size-4" /> Season</span><Correlation corr={season.corr} /></div><h2 className="mt-3 text-xl font-semibold">{season.name} <span className="text-sm font-normal text-muted-foreground">/ {et.month}</span></h2><p className={`mt-2 ${muted}`}>{season.note}</p><p className="mt-2 text-xs italic text-muted-foreground">{season.caveat}</p></section>
        <section className={panel}><div className={`${label} justify-between`}><span className="flex items-center gap-2"><CalendarRange className="size-4" /> Day of week</span><Correlation corr={day.corr} /></div><h2 className="mt-3 text-xl font-semibold">{day.name} <span className="text-xs font-normal text-muted-foreground">{day.mentions} mentions</span></h2><p className={`mt-2 ${muted}`}>{day.role}</p><ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">{day.lookFor.map((item) => <li key={item} className="border-l-2 border-border pl-3">{item}</li>)}</ul></section>
        <section className={panel}><div className={`${label} justify-between`}><span className="flex items-center gap-2"><Clock3 className="size-4" /> Time of day</span><Correlation corr={windowNow.corr} /></div><h2 className="mt-3 text-xl font-semibold">{windowNow.name}</h2><p className="mt-1 text-xs text-muted-foreground">{windowNow.time} ET</p><p className={`mt-2 ${muted}`}>{windowNow.summary}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-chart-2 transition-[width] duration-1000" style={{ width: `${et.minutesOfDay / 14.4}%` }} /></div><div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span></div><p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Timer className="size-4 shrink-0" /> Next: <span className="font-medium text-foreground">{nextWindow.name}</span> · {Math.floor(minutesUntil / 60)}h {minutesUntil % 60}m</p></section>
      </div>

      <section className="border-b border-border py-7"><div className={`${label} justify-between`}><span className="flex items-center gap-2"><Activity className="size-4" /> Focus now</span>{!closed && <Correlation corr={guidance.corr} />}</div><h2 className="mt-3 text-2xl font-semibold">{guidance.title}</h2><p className={`mt-2 max-w-3xl ${muted}`}>{guidance.summary}</p>{guidance.dayContext && <p className="mt-3 text-xs text-muted-foreground">{guidance.dayContext}</p>}
        {guidance.warnings.length > 0 && <div className="mt-4 space-y-2">{guidance.warnings.map((warning, i) => <p key={`${warning.kind}-${i}`} className="flex gap-2 border-l-2 border-chart-4 bg-chart-4/5 px-3 py-2 text-xs leading-relaxed"><TriangleAlert className="size-4 shrink-0 text-chart-4" /><span><strong>{warning.kind}:</strong> {warning.text}</span></p>)}</div>}
        <h3 className="mt-6 text-xs font-semibold uppercase text-muted-foreground">Session checklist</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{guidance.checklist.map((item, i) => <Button key={item} variant="outline" aria-pressed={completed.includes(item)} onClick={() => setCompleted((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item])} className={`h-auto min-h-12 justify-start whitespace-normal px-3 py-2 text-left text-xs font-normal leading-relaxed ${completed.includes(item) ? "text-muted-foreground line-through" : ""}`}><span className="flex size-5 shrink-0 items-center justify-center rounded border border-border">{completed.includes(item) ? <Check className="size-3" /> : i + 1}</span>{item}</Button>)}</div>
      </section>

      <section className="border-b border-border py-7"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className={`${label} !text-foreground`}><Newspaper className="size-4" /> Red-folder news · this week</h2><Button size="sm" variant="outline" disabled={loading} onClick={() => void load()} title="Refresh calendar"><RefreshCw className={loading ? "animate-spin" : ""} /> Refresh</Button></div><p className="mt-2 text-xs text-muted-foreground">High-impact economic events from the Forex Factory calendar · all times ET</p>
        {news?.error && <p role="alert" className="mt-4 flex gap-2 text-xs text-destructive"><TriangleAlert className="size-4 shrink-0" /> {news.stale ? "Showing the last available calendar." : "Live calendar is unavailable."} {news.error}</p>}
        {loading && !news && <p className="mt-4 text-sm text-muted-foreground">Loading economic calendar…</p>}
        {!loading && !news?.error && events.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No high-impact events listed for this week.</p>}
        <div className="mt-4 max-h-96 space-y-4 overflow-y-auto">{Object.entries(groups).map(([date, items]) => <div key={date}><h3 className="sticky top-0 bg-background py-1 text-xs font-semibold text-muted-foreground">{new Date(`${date.slice(6)}-${date.slice(0, 2)}-${date.slice(3, 5)}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{date === today && <span className="ml-2 text-chart-2">Today</span>}</h3><div className="divide-y divide-border">{items.map((event, i) => <div key={`${event.isoDate}-${i}`} className="grid grid-cols-[auto_1fr_auto] gap-3 py-2 text-xs sm:grid-cols-[4rem_1fr_auto]"><span className="font-semibold text-chart-4">{event.currency}</span><div><p className="font-medium text-foreground">{event.title}</p><p className="mt-1 text-muted-foreground">{event.actual && `Actual ${event.actual} · `}{event.forecast && `Forecast ${event.forecast} · `}{event.previous && `Previous ${event.previous}`}</p></div><time className="whitespace-nowrap text-muted-foreground">{event.time} ET</time></div>)}</div></div>)}</div>{news?.fetchedAt && <p className="mt-3 text-xs text-muted-foreground">Updated {new Date(news.fetchedAt).toLocaleTimeString()} · {events.length} events</p>}
      </section>

      <section className="border-b border-border py-7"><h2 className={`${label} !text-foreground`}><ShieldAlert className="size-4" /> USD red-folder playbook</h2><p className="mt-2 text-xs text-muted-foreground">Educational handling notes by release; a scheduled event is highlighted when it appears in this week's calendar.</p><div className="mt-5 grid gap-x-8 md:grid-cols-2">{NEWS_PLAYBOOK.map((entry) => { const matches = events.filter((event) => matchNewsPlaybook(event)?.key === entry.key); return <div key={entry.key} className={`border-t py-4 ${matches.length ? "border-chart-2" : "border-border"}`}><div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold">{entry.title}</h3><p className="mt-1 text-xs text-muted-foreground">{entry.time}</p></div><Correlation corr={entry.corr} /></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{entry.summary}</p>{matches.length > 0 && <p className="mt-2 text-xs font-medium text-chart-2">This week: {matches.map((event) => `${event.date} ${event.time} ET`).join(" · ")}</p>}<ul className="mt-3 space-y-2">{entry.checklist.map((point) => <li key={point} className="border-l-2 border-border pl-3 text-xs leading-relaxed text-muted-foreground">{point}</li>)}</ul></div>; })}</div></section>

      <section className="py-5"><Accordion type="multiple" className="divide-y divide-border"><AccordionItem value="weekly"><AccordionTrigger className="text-base">Full weekly map <span className="ml-auto mr-3 text-xs font-normal text-muted-foreground">Every day's role</span></AccordionTrigger><AccordionContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{WEEKLY_RHYTHM.map((item) => <div key={item.day} className={`border-l-2 pl-3 ${item.day.toLowerCase() === et.weekdayKey.slice(0, 3) ? "border-chart-2" : "border-border"}`}><h3 className="font-semibold">{item.day}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p></div>)}</div></AccordionContent></AccordionItem>
        <AccordionItem value="daily"><AccordionTrigger className="text-base">Full daily map <span className="ml-auto mr-3 text-xs font-normal text-muted-foreground">Session windows · ET</span></AccordionTrigger><AccordionContent><div className="space-y-2">{TIME_WINDOWS.map((item) => <div key={item.id} className={`grid gap-2 border-l-2 py-1 pl-3 sm:grid-cols-[9rem_1fr] ${item.id === windowNow.id ? "border-chart-2" : "border-border"}`}><span className="text-xs text-muted-foreground">{item.time}</span><div><span className="font-medium">{item.name}</span> <Correlation corr={item.corr} /><p className="mt-1 text-xs text-muted-foreground">{item.summary}</p><ul className="mt-2 space-y-1 text-xs text-muted-foreground">{item.checklist.map((point) => <li key={point}>• {point}</li>)}</ul></div></div>)}</div><h3 className="mt-6 mb-3 font-semibold">Daily rhythm</h3><div className="grid gap-3 sm:grid-cols-2">{DAILY_RHYTHM.map((item) => <p key={item.time} className="text-xs leading-relaxed"><strong className="mr-2">{item.time}</strong><span className="text-muted-foreground">{item.text}</span></p>)}</div></AccordionContent></AccordionItem>
        <AccordionItem value="seasonal"><AccordionTrigger className="text-base">Seasonal notes <span className="ml-auto mr-3 text-xs font-normal text-muted-foreground">Context, not signals</span></AccordionTrigger><AccordionContent><p className="mb-4 text-xs text-muted-foreground">This is the least-supported dimension in the transcript archive.</p><div className="grid gap-4 sm:grid-cols-2">{SEASONS.map((item) => <div key={item.key} className={`border-l-2 pl-3 ${item.key === season.key ? "border-chart-2" : "border-border"}`}><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{item.name}</h3><Correlation corr={item.corr} /></div><p className="mt-1 text-xs text-muted-foreground">{item.months.join(", ")}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.note}</p><p className="mt-2 text-xs italic text-muted-foreground">{item.caveat}</p></div>)}</div></AccordionContent></AccordionItem>
        <AccordionItem value="vocabulary"><AccordionTrigger className="text-base">Transcript guide · vocabulary <span className="ml-auto mr-3 text-xs font-normal text-muted-foreground">Ranked concepts</span></AccordionTrigger><AccordionContent><div className="grid gap-3 sm:grid-cols-2">{VOCABULARY.map((item) => <div key={item.term} className="flex gap-3 text-xs"><span className="text-chart-2">{String(item.rank).padStart(2, "0")}</span><div><h3 className="font-semibold text-foreground">{item.term}</h3><p className="mt-1 text-muted-foreground">{item.note}</p></div></div>)}</div></AccordionContent></AccordionItem></Accordion></section>
      <footer className="border-t border-border py-5 text-xs leading-relaxed text-muted-foreground"><p className="flex gap-2"><Info className="size-4 shrink-0" />{SOURCE_NOTE}</p><p className="mt-3">Educational market context only, not financial or trading advice. Correlation counts describe mentions in the source archive, not predictive success.</p><p className="mt-3">{Object.values(CORRELATION).map((corr) => `${corr.stars} ${corr.label}: ${corr.note}`).join(" · ")}</p></footer>
    </main>
  </div>;
}
