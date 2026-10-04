import { createServerFn } from "@tanstack/react-start";
import type { GuideNewsEvent } from "./ict-guide";

type PulseNews = { events: GuideNewsEvent[]; fetchedAt: string | null; error: string | null; stale: boolean };
let newsCache: PulseNews | null = null;
let cachedAt = 0;
const CACHE_MS = 30 * 60 * 1000;

export const getPulse = createServerFn({ method: "GET" })
  .handler(async () => {
    if (newsCache && Date.now() - cachedAt < CACHE_MS) return newsCache;
    try {
      const response = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
        headers: { Accept: "application/json", "User-Agent": "ICT-Pulse/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Calendar returned ${response.status}`);
      const feed: unknown = await response.json();
      if (!Array.isArray(feed)) throw new Error("Unexpected calendar response");
      const events: GuideNewsEvent[] = feed
        .filter((event) => event && String(event.impact).toLowerCase() === "high" && typeof event.date === "string")
        .map((event): GuideNewsEvent | null => {
          const date = new Date(event.date);
          if (Number.isNaN(date.getTime())) return null;
          const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "2-digit", day: "2-digit", year: "numeric" }).formatToParts(date);
          const part = (name: string) => parts.find((p) => p.type === name)?.value ?? "";
          return {
            title: String(event.title ?? ""),
            country: String(event.country ?? ""),
            currency: String(event.country ?? ""),
            date: `${part("month")}-${part("day")}-${part("year")}`,
            time: new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }).format(date),
            impact: "High",
            forecast: String(event.forecast ?? ""),
            previous: String(event.previous ?? ""),
            actual: String(event.actual ?? ""),
            isoDate: date.toISOString(),
          };
        })
        .filter((event): event is GuideNewsEvent => event !== null)
        .sort((a, b) => (a.isoDate ?? "").localeCompare(b.isoDate ?? ""));
      newsCache = { events, fetchedAt: new Date().toISOString(), error: null, stale: false };
      cachedAt = Date.now();
      return newsCache;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Calendar unavailable";
      console.error("ICT Pulse calendar:", message);
      return newsCache ? { ...newsCache, stale: true, error: message } : { events: [], fetchedAt: null, stale: false, error: message };
    }
  });
