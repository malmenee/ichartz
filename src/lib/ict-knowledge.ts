// Curated "right now" knowledge base for the ICT Pulse feature.
//
// IMPORTANT: this content is written in original wording. It's informed by
// which concepts a large corpus of ICT-methodology source material emphasizes
// most (kill zones, session opens, and "seasonal tendency" were by far the
// most frequently discussed ideas), but no transcript text is reproduced
// here — these are commonly-taught price-action/market-structure concepts
// explained in our own words, not anyone's copyrighted script.

export type KillZone = {
  id: string;
  name: string;
  startHourET: number; // 0-23, local ET hour the window opens
  startMinET: number;
  endHourET: number;
  endMinET: number;
  summary: string;
  focus: string; // "what to do right now" copy for this window
};

// Hours are ET (America/New_York) and don't adjust for individual DST
// transition days, which is accurate enough for a "what window are we in"
// read — Intl.DateTimeFormat below handles the actual DST-correct conversion
// of the viewer's current time into ET.
export const KILL_ZONES: KillZone[] = [
  {
    id: "asian",
    name: "Asian Session",
    startHourET: 20,
    startMinET: 0,
    endHourET: 24,
    endMinET: 0,
    summary:
      "Typically the quietest session for USD-denominated markets — lower liquidity, often builds a tighter range that later sessions react against.",
    focus:
      "Not a window most intraday traders are taught to actively trade. Worth noting the range it builds, since London and New York often sweep one side of it.",
  },
  {
    id: "london-open",
    name: "London Open",
    startHourET: 2,
    startMinET: 0,
    endHourET: 5,
    endMinET: 0,
    summary:
      "The session's early move frequently fakes out before the real direction shows — a liquidity sweep of the Asian range is common here.",
    focus:
      "Watch for a sweep of the Asian high or low that quickly reverses. Treat the first move with suspicion rather than chasing it.",
  },
  {
    id: "ny-premarket",
    name: "NY Pre-Market",
    startHourET: 7,
    startMinET: 0,
    endHourET: 9,
    endMinET: 30,
    summary:
      "Overlaps with the tail of London. Scheduled high-impact data (like CPI) commonly lands at 8:30 AM ET inside this window.",
    focus:
      "Mark the high/low this window builds — it's a reference range for the regular-hours open. Check the economic calendar for anything landing at 8:30.",
  },
  {
    id: "ny-open",
    name: "NY Open",
    startHourET: 9,
    startMinET: 30,
    endHourET: 10,
    endMinET: 0,
    summary:
      "The regular-hours open often produces its own fakeout (a 'Judas swing') before the session's real direction takes over.",
    focus:
      "Let the first swing resolve before committing. A quick move that reverses within this half hour is more common than a clean trend start.",
  },
  {
    id: "am-silver-bullet",
    name: "NY AM Silver Bullet",
    startHourET: 10,
    startMinET: 0,
    endHourET: 11,
    endMinET: 0,
    summary:
      "A narrow, specifically-named window taught as one of the clearest intraday setups — look for a liquidity sweep followed by a structure shift.",
    focus:
      "This is a high-attention hour. Watch for price sweeping a recent high/low and then shifting structure in the opposite direction — that's the core setup this window is built around.",
  },
  {
    id: "lunch",
    name: "Lunch / Consolidation",
    startHourET: 12,
    startMinET: 0,
    endHourET: 13,
    endMinET: 30,
    summary: "Lower-quality, choppier price action as the morning crowd steps away.",
    focus:
      "Commonly taught as a window to sit out rather than force trades. Good time to review the morning's structure instead of opening new risk.",
  },
  {
    id: "pm-silver-bullet",
    name: "NY PM Silver Bullet",
    startHourET: 14,
    startMinET: 0,
    endHourET: 15,
    endMinET: 0,
    summary:
      "Includes FOMC statement releases (2:00 PM ET on meeting days) — often produces a sharp continuation or reversal move.",
    focus:
      "Same playbook as the AM window — watch for a sweep + structure shift. On FOMC days, expect the first move after 2:00 to be unreliable; the real direction often takes 20-30 minutes to show.",
  },
  {
    id: "close",
    name: "Close / Overnight Transition",
    startHourET: 15,
    startMinET: 0,
    endHourET: 16,
    endMinET: 0,
    summary: "Liquidity thins out heading into the close as day traders flatten positions.",
    focus:
      "Lower-conviction window for new entries. More useful for reviewing the day's structure than opening fresh risk.",
  },
];

export type DayFocus = {
  day: number; // 0=Sunday .. 6=Saturday
  name: string;
  summary: string;
  focus: string;
};

export const DAY_FOCUS: DayFocus[] = [
  {
    day: 1,
    name: "Monday",
    summary: "Often range-defining for the week — the week's initial high and low frequently get set today.",
    focus: "Favor observing over forcing a trade. The range built today becomes a reference point for the rest of the week.",
  },
  {
    day: 2,
    name: "Tuesday",
    summary: "Can extend or reject Monday's range as directional conviction starts to build.",
    focus: "Watch whether price respects or breaks Monday's high/low — that reaction says a lot about the week's likely direction.",
  },
  {
    day: 3,
    name: "Wednesday",
    summary:
      "Frequently framed as the week's pivot day, especially on weeks carrying CPI (8:30 AM ET) or an FOMC decision (2:00 PM ET) — the day with the highest concentration of major scheduled catalysts.",
    focus: "Check the economic calendar before the session. If a red-folder event is scheduled today, plan around it rather than being surprised by it.",
  },
  {
    day: 4,
    name: "Thursday",
    summary: "Often a continuation day once Wednesday's catalyst (if any) has resolved direction.",
    focus: "Look for follow-through on whatever direction Wednesday confirmed, rather than a fresh, unrelated setup.",
  },
  {
    day: 5,
    name: "Friday",
    summary:
      "Typically range-completion and profit-taking, with liquidity thinning into the close. Non-Farm Payrolls (first Friday of the month, 8:30 AM ET) is a notable exception that can drive a fresh directional move.",
    focus: "Be cautious chasing new positions into the weekend. If it's NFP Friday, treat the number like any other red-folder event — plan, don't react.",
  },
];

export const SEASONAL_FRAMING = {
  title: "Quarterly / seasonal framing",
  summary:
    "Seasonal tendency here isn't \"this month is always bullish\" — it's about where price currently sits relative to its own recent range: the last month, the last quarter, and the last 12 months. Sitting in the upper half of that range (premium) vs. the lower half (discount) shapes the macro bias for the next one to three months. Large directional shifts also tend to cluster around quarter boundaries rather than being spread evenly through the year.",
};

export const NEWS_PHILOSOPHY = {
  title: "How to think about red-folder news",
  points: [
    "High-impact events land on a knowable schedule — CPI and FOMC specifically tend to fall on Wednesdays (8:30 AM ET and 2:00 PM ET respectively), and Non-Farm Payrolls on the first Friday of the month at 8:30 AM ET. Knowing the calendar ahead of time means you can form a bias before the number, not just react to it.",
    "The headline number matters less than how price actually reacts to it relative to the standing higher-timeframe draw on liquidity — a \"good\" number that gets sold off is more informative than the number itself.",
    "A common practice is avoiding fresh risk in the minutes immediately around a release, letting the initial spike or fakeout resolve, and looking for the structure shift that confirms the real direction before acting.",
  ],
};

// --- "Right now" selection logic -------------------------------------------------

function nowInET(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const hour = parseInt(get("hour"), 10) % 24;
  const minute = parseInt(get("minute"), 10);
  const day = weekdayMap[get("weekday")] ?? date.getUTCDay();
  return { hour, minute, day };
}

export function getActiveKillZone(date: Date): KillZone | null {
  const { hour, minute } = nowInET(date);
  const minutesNow = hour * 60 + minute;
  for (const kz of KILL_ZONES) {
    const start = kz.startHourET * 60 + kz.startMinET;
    const end = kz.endHourET * 60 + kz.endMinET;
    if (start <= end) {
      if (minutesNow >= start && minutesNow < end) return kz;
    } else {
      // window wraps past midnight (not currently used, but handled for safety)
      if (minutesNow >= start || minutesNow < end) return kz;
    }
  }
  return null;
}

export function getDayFocus(date: Date): DayFocus | null {
  const { day } = nowInET(date);
  return DAY_FOCUS.find((d) => d.day === day) ?? null;
}

export function getQuarterProgress(date: Date) {
  const month = date.getUTCMonth(); // 0-11
  const quarter = Math.floor(month / 3) + 1;
  const quarterStartMonth = (quarter - 1) * 3;
  const quarterStart = Date.UTC(date.getUTCFullYear(), quarterStartMonth, 1);
  const quarterEnd = Date.UTC(date.getUTCFullYear(), quarterStartMonth + 3, 1);
  const pct = Math.round(((date.getTime() - quarterStart) / (quarterEnd - quarterStart)) * 100);
  return { quarter, year: date.getUTCFullYear(), percentThroughQuarter: Math.min(99, Math.max(1, pct)) };
}
