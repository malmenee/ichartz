// Shared ICT Pulse context: kill zones (ET, DST-correct), day behaviour, season
// and red-folder news windows for one asset. Used by the /pulse page (via a
// server function) and by getTradeIdeas (prompt + post-generation validation).
import { SEASONS, getDay } from "./ict-guide";
import { fetchRedFolderNews, type FFEvent } from "./news-calendar.server";

export const KILL_ZONES = [
  { id: "london", name: "London Kill Zone", start: 60, end: 300 },
  { id: "ny_am", name: "New York AM Kill Zone", start: 420, end: 660 },
  { id: "london_close", name: "London Close Kill Zone", start: 660, end: 690 },
  { id: "ny_pm", name: "New York PM Kill Zone", start: 810, end: 910 },
  { id: "asian", name: "Asian Kill Zone", start: 1200, end: 1440 },
] as const;

/** Scheduled FOMC rate-decision days (ET), per the Federal Reserve calendar. */
export const FOMC_DATES = new Set([
  "2025-01-29", "2025-03-19", "2025-05-07", "2025-06-18", "2025-07-30", "2025-09-17", "2025-10-29", "2025-12-10",
  "2026-01-28", "2026-03-18", "2026-04-29", "2026-06-17", "2026-07-29", "2026-09-16", "2026-10-28", "2026-12-09",
]);

const SEASON_BY_MONTH = ["winter", "winter", "spring", "spring", "spring", "summer", "summer", "summer", "fall", "fall", "fall", "winter"] as const;
const NEWS_BUFFER_MIN = 15;

export function seasonForMonthIndex(monthIndex: number) {
  const key = SEASON_BY_MONTH[((monthIndex % 12) + 12) % 12];
  return SEASONS.find((s) => s.key === key)!;
}

type EtParts = { y: number; m: number; d: number; minutes: number; weekdayKey: string };
export function etParts(date: Date): EtParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", weekday: "long", hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const hour = Number(get("hour")) % 24;
  return { y: Number(get("year")), m: Number(get("month")), d: Number(get("day")), minutes: hour * 60 + Number(get("minute")), weekdayKey: get("weekday").toLowerCase() };
}
const dateKey = (p: { y: number; m: number; d: number }) => `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;

function offsetMinutes(date: Date) {
  const p = etParts(date);
  const wall = Date.UTC(p.y, p.m - 1, p.d, 0, p.minutes);
  return Math.round((wall - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

/** Converts an ET wall-clock time (minutes from midnight, may exceed 1440) to a UTC instant. */
export function etToUtc(y: number, m: number, d: number, minutes: number): Date {
  const wall = Date.UTC(y, m - 1, d, 0, minutes);
  let t = wall + 5 * 3600000;
  for (let i = 0; i < 3; i++) t = wall - offsetMinutes(new Date(t)) * 60000;
  return new Date(t);
}

function addDays(p: { y: number; m: number; d: number }, n: number) {
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

export type ZoneInstance = { id: string; name: string; startEt: string; endEt: string; start: string; end: string };
const fmtEt = (min: number) => { const h = Math.floor(min / 60) % 24; return `${String(h).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`; };

function zoneInstances(now: Date): ZoneInstance[] {
  const today = etParts(now);
  const out: ZoneInstance[] = [];
  for (const offset of [-1, 0, 1]) {
    const day = addDays(today, offset);
    for (const z of KILL_ZONES) {
      out.push({ id: z.id, name: z.name, startEt: fmtEt(z.start), endEt: fmtEt(z.end), start: etToUtc(day.y, day.m, day.d, z.start).toISOString(), end: etToUtc(day.y, day.m, day.d, z.end).toISOString() });
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export function currenciesForAsset(assetRaw: string): string[] {
  const a = (assetRaw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!a) return [];
  if (/(XAU|GOLD|XAG|SILVER|WTI|BRENT|USOIL|UKOIL|OIL|BTC|ETH|SOL|XRP|DOGE|BNB|ADA|USDT|USDC|SPX|SP500|NAS|NDX|NQ|DJI|US30|US100|US500|RUT|^ES)/.test(a)) return ["USD"];
  if (/(DAX|GER40|GER30)/.test(a)) return ["EUR"];
  if (/(FTSE|UK100)/.test(a)) return ["GBP"];
  if (/(NIKKEI|JP225|N225)/.test(a)) return ["JPY"];
  if (/(HSI|HK50)/.test(a)) return ["CNY", "HKD"];
  if (/(ASX|AUS200)/.test(a)) return ["AUD"];
  return ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF", "CNY"].filter((c) => a.includes(c));
}

const FOMC_DECISION = /fomc (statement|press)|federal funds rate|rate decision/i;
export function isRealFomcDate(date: Date) { return FOMC_DATES.has(dateKey(etParts(date))); }

export type NewsWindow = { title: string; currency: string; at: string; start: string; end: string; forecast?: string; previous?: string };

export function newsWindowsFor(events: FFEvent[], asset: string, now: Date, hours = 48): NewsWindow[] {
  const ccys = currenciesForAsset(asset);
  const from = now.getTime() - 2 * 3600000;
  const to = now.getTime() + hours * 3600000;
  const picked = events.filter((e) => {
    if (!ccys.includes((e.country || "").toUpperCase())) return false;
    const t = new Date(e.date);
    if (Number.isNaN(t.getTime()) || t.getTime() < from || t.getTime() > to) return false;
    if (e.country === "USD" && FOMC_DECISION.test(e.title) && !isRealFomcDate(t)) return false;
    return true;
  }).map((e) => ({ title: e.title, currency: e.country, at: new Date(e.date), forecast: e.forecast, previous: e.previous }));
  if (ccys.includes("USD")) {
    for (const k of FOMC_DATES) {
      const [y, m, d] = k.split("-").map(Number);
      const at = etToUtc(y, m, d, 14 * 60);
      if (at.getTime() < from || at.getTime() > to) continue;
      if (picked.some((p) => /fomc|federal funds/i.test(p.title) && Math.abs(p.at.getTime() - at.getTime()) < 3600000)) continue;
      picked.push({ title: "FOMC Rate Decision", currency: "USD", at, forecast: undefined, previous: undefined });
    }
  }
  return picked.sort((a, b) => a.at.getTime() - b.at.getTime()).map((p) => ({
    title: p.title, currency: p.currency, at: p.at.toISOString(), forecast: p.forecast, previous: p.previous,
    start: new Date(p.at.getTime() - NEWS_BUFFER_MIN * 60000).toISOString(),
    end: new Date(p.at.getTime() + NEWS_BUFFER_MIN * 60000).toISOString(),
  }));
}

export function buildPulseContext(now: Date, asset: string, events: FFEvent[]) {
  const p = etParts(now);
  const zones = zoneInstances(now);
  const nowIso = now.toISOString();
  const current = zones.find((z) => z.start <= nowIso && nowIso < z.end) ?? null;
  const next = zones.find((z) => z.start > nowIso) ?? null;
  const day = getDay(p.weekdayKey);
  const season = seasonForMonthIndex(p.m - 1);
  return {
    now: nowIso,
    asset,
    etDate: dateKey(p),
    etMinutes: p.minutes,
    currentKillZone: current,
    nextKillZone: next,
    zones,
    day: { key: p.weekdayKey, name: day.name, role: day.role, lookFor: day.lookFor },
    season: { key: season.key, name: season.name, note: season.note },
    isFomcDay: FOMC_DATES.has(dateKey(p)),
    newsWindows: newsWindowsFor(events, asset, now),
  };
}
export type PulseContext = ReturnType<typeof buildPulseContext>;

export async function getPulseContext(now: Date, asset: string): Promise<PulseContext> {
  return buildPulseContext(now, asset, await fetchRedFolderNews(48));
}

export function pulseContextPrompt(ctx: PulseContext) {
  const zones = KILL_ZONES.map((z) => `- ${z.name}: ${fmtEt(z.start)}-${fmtEt(z.end)} ET`).join("\n");
  const news = ctx.newsWindows.length
    ? ctx.newsWindows.map((n) => `- ${n.at} UTC [${n.currency}] ${n.title} → no entries ${n.start}–${n.end} UTC`).join("\n")
    : `No high-impact events in the next 48h that directly affect ${ctx.asset}.`;
  return `ICT PULSE CONTEXT (ET date ${ctx.etDate}):
Current kill zone: ${ctx.currentKillZone?.name ?? "none (between kill zones)"}
Next kill zone: ${ctx.nextKillZone ? `${ctx.nextKillZone.name} starting ${ctx.nextKillZone.start} UTC` : "none"}
Day: ${ctx.day.name} — ${ctx.day.role}${ctx.isFomcDay ? " (scheduled FOMC decision today)" : ""}
Season: ${ctx.season.name} — ${ctx.season.note}
Defined kill zones (ET):
${zones}
Red-folder news windows (±15 min, UTC):
${news}`;
}

export type PulseAlignment = "aligned" | "partial" | "off_window";

function parseRange(s: unknown): [number, number] | null {
  const m = typeof s === "string" ? s.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/) : null;
  if (!m) return null;
  const a = Number(m[1]) * 60 + Number(m[2]);
  let b = Number(m[3]) * 60 + Number(m[4]);
  if (a >= 1440 || b > 1440) return null;
  if (b <= a) b += 1440;
  return [a, b];
}

/** Validates an idea's ET window against kill zones and news windows. */
export function assessIdeaWindow(windowEt: unknown, ctx: PulseContext, now: Date) {
  const range = parseRange(windowEt);
  if (!range) return { pulse_alignment: "off_window" as PulseAlignment, window_start: null, window_end: null, alignment_note: "No valid ET window given." };
  const today = etParts(now);
  let day = { y: today.y, m: today.m, d: today.d };
  if (etToUtc(day.y, day.m, day.d, range[1]).getTime() <= now.getTime()) day = addDays(day, 1);
  const ws = etToUtc(day.y, day.m, day.d, range[0]).toISOString();
  const we = etToUtc(day.y, day.m, day.d, range[1]).toISOString();
  const inside = ctx.zones.some((z) => z.start <= ws && we <= z.end);
  const overlaps = ctx.zones.some((z) => z.start < we && ws < z.end);
  const clash = ctx.newsWindows.find((n) => n.start < we && ws < n.end);
  const pulse_alignment: PulseAlignment = !overlaps ? "off_window" : inside && !clash ? "aligned" : "partial";
  const alignment_note = !overlaps ? "Window falls outside every kill zone."
    : clash ? `Within 15 minutes of ${clash.title}.`
    : inside ? "Inside a kill zone, clear of red-folder news." : "Only partly inside a kill zone.";
  return { pulse_alignment, window_start: ws, window_end: we, alignment_note };
}
