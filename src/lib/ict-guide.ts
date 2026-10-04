// ICT Trading Day — data extracted from the 639-transcript field guide.
// All times are Eastern Time (ET) / New York local time.

export const CORRELATION = {
  STRONG: { label: "STRONG", stars: "★★★", note: "35%+ of 639 videos — core, everyday habit" },
  MODERATE: { label: "MODERATE", stars: "★★", note: "12–35% of 639 videos — recurring tool" },
  NOTED: { label: "NOTED", stars: "★", note: "3–12% of 639 videos — situational / advanced" },
  RARE: { label: "RARE", stars: "·", note: "under 3% of 639 videos — mentioned, not a pillar" },
};

export const DAYS = {
  monday: {
    name: "Monday", mentions: "250 / 639", corr: CORRELATION.STRONG,
    role: "Sets the week's reference high / low; post-holiday = trade light.",
    lookFor: [
      "Mark Monday's intraday high and low — they become the week's first liquidity references (relative equal highs / lows).",
      "If Monday follows a holiday, size down to a single contract or paper-trade to read the thin post-holiday tape.",
      "Don't force full size on unusually thin post-holiday liquidity — use it to calibrate, not to press.",
    ],
  },
  tuesday: {
    name: "Tuesday", mentions: "217 / 639", corr: CORRELATION.MODERATE,
    role: "Often where the week's true high or low actually prints.",
    lookFor: [
      "Watch for Monday's (or Tuesday's) highs / lows being swept — that liquidity run is frequently the setup for the week's real directional move.",
      "Tuesday is a common source of the week's 'relative equal highs / lows' — levels price returns to sweep before reversing.",
    ],
  },
  wednesday: {
    name: "Wednesday", mentions: "186 / 639", corr: CORRELATION.NOTED,
    role: "FOMC day; midweek reversal candidate.",
    lookFor: [
      "On FOMC Wednesdays: expect an initial (often deceptive) push, then a second, more decisive leg — don't assume the first move is the real one.",
      "Check the 'Wednesday reversal' / 'Wednesday low of the week' template against price structure every midweek, FOMC or not.",
      "Watch whether Monday / Tuesday's highs or lows get taken out — that sweep often sets up the week's actual move.",
    ],
  },
  thursday: {
    name: "Thursday", mentions: "213 / 639", corr: CORRELATION.NOTED,
    role: "Pre-NFP manipulation day; classic 'Thursday reversal' profile.",
    lookFor: [
      "Treat Thursday of NFP week as a higher-manipulation environment — expect stop runs against the obvious direction before the real move.",
      "NFP-week rule: stand down on new setups after 11:00 AM Wednesday until the Friday 8:30 AM report has printed.",
      "Watch for the 'Thursday reversal' profile — a midweek directional flip.",
    ],
  },
  friday: {
    name: "Friday", mentions: "294 / 639", corr: CORRELATION.STRONG,
    role: "Week's liquidity target + NFP volatility day.",
    lookFor: [
      "First Friday of the month = NFP at 8:30 AM ET. Elevated manipulation into the report — let the initial reaction resolve before committing size.",
      "Friday is the week's liquidity target — the weekly high / low often gets swept or extended here.",
      "After a strong one-directional week, expect a ~20–30% retracement back into the range ('TGIF' pullback).",
    ],
  },
  sunday: {
    name: "Sunday", mentions: "154 / 639", corr: CORRELATION.MODERATE,
    role: "Week's opening price (futures reopen ~6:00 PM); thin, low-reliability.",
    lookFor: [
      "Futures reopen ~6:00 PM ET Sunday — this prints the week's opening price / weekly midnight open.",
      "Carry the weekly open all week as the premium / discount anchor: above it favors longs, below it favors shorts.",
      "Liquidity is thin — read, don't press.",
    ],
  },
  saturday: {
    name: "Saturday", mentions: "72 / 639", corr: CORRELATION.RARE,
    role: "Market closed — referenced only for weekend gap / holiday context.",
    lookFor: [
      "Markets are closed. Use the time to review the week's structure and plan the weekly open.",
    ],
  },
};

// Time windows — non-overlapping, covering 24h. start/end are minutes from midnight ET.
export const TIME_WINDOWS = [
  {
    id: "midnight", name: "Midnight / True Day Open", time: "12:00–1:00 AM", start: 0, end: 60,
    corr: CORRELATION.NOTED, count: "29 / 639",
    summary: "The midnight opening price — key reference for premium vs. discount and the Judas swing.",
    checklist: [
      "Mark the midnight (true day) open — judge whether price is trading above or below where the New York day began.",
      "Watch for a Judas swing: a false move away from this price that then reverses.",
      "On Monday, this open is carried forward and watched all week.",
    ],
  },
  {
    id: "london", name: "London Kill Zone", time: "1:00–5:00 AM", start: 60, end: 300,
    corr: CORRELATION.STRONG, count: "250 / 639",
    summary: "The first real directional session — the day's defining move often starts here.",
    checklist: [
      "Primary directional session — the day's real move can print well before New York opens.",
      "Expect Judas swings: a push in one direction that gets swept before the true move unfolds.",
      "Mark London's high / low — a frequent session high / low prints in this window.",
    ],
  },
  {
    id: "intersession", name: "Inter-session lull", time: "5:00–7:00 AM", start: 300, end: 420,
    corr: CORRELATION.MODERATE, count: "100 / 639",
    summary: "London close tail / pre-NY build — lower conviction; wait for the New York pre-market.",
    checklist: [
      "London close tail — liquidity often thins here before the NY build.",
      "Carry London's high / low into the NY open as the session's first reference levels.",
      "Stand down unless an obvious liquidity sweep sets up into the pre-market.",
    ],
  },
  {
    id: "premarket", name: "Pre-Market / Early NY", time: "7:00–9:30 AM", start: 420, end: 570,
    corr: CORRELATION.MODERATE, count: "80 / 639",
    summary: "NY Open Kill Zone begins — builds the pre-market high / low the 9:30 open reacts to.",
    checklist: [
      "Build the pre-market high / low — the 9:30 cash open frequently reacts to these levels.",
      "Don't commit before the cash open unless an obvious liquidity sweep sets up.",
      "Note any displacement into the open — it sets the early bias.",
    ],
  },
  {
    id: "open", name: "NY Cash Open / Opening Range", time: "9:30–9:50 AM", start: 570, end: 590,
    corr: CORRELATION.MODERATE, count: "80 / 639",
    summary: "The single most-referenced moment of the day. Classify the Opening Range Gap.",
    checklist: [
      "Compare the 9:30 open to yesterday's 4:14 PM close: open below = discount ORG (bullish draw up toward the gap midpoint), open above = premium ORG (bearish draw down).",
      "First 30 min (9:30–10:00) is the opening range — its midpoint (consequent encroachment) is a near-inevitable early magnet.",
      "Grade the first 60 min (9:30–10:30) as the 'first hour's dealing range' — it locks in at 10:30.",
    ],
  },
  {
    id: "ammacro", name: "AM Macro Window", time: "9:50–10:00 AM", start: 590, end: 600,
    corr: CORRELATION.MODERATE, count: "136 / 639",
    summary: "The last 10 minutes of the 9:00 hour — algorithmic delivery accelerates into the Silver Bullet.",
    checklist: [
      "Macro rule: the last 10 min of a closing hour accelerates algorithmic delivery into the next hour.",
      "Watch for the first fair value gap to form after 10:00 — the Silver Bullet trigger.",
    ],
  },
  {
    id: "silverbullet", name: "AM Silver Bullet", time: "10:00–11:00 AM", start: 600, end: 660,
    corr: CORRELATION.NOTED, count: "54 / 639",
    summary: "Wait for the first fair value gap after 10:00 — a near-daily, high-repeatability setup.",
    checklist: [
      "Silver Bullet: wait for the first FVG to form after 10:00 AM, then trade the displacement back through it.",
      "Overlaps the London Close kill zone (10:00–noon) — a common session high / low prints here.",
      "Described as happening 'every single day without fail' — low barrier, high repeatability.",
    ],
  },
  {
    id: "londonclose", name: "London Close Kill Zone", time: "11:00–11:30 AM", start: 660, end: 690,
    corr: CORRELATION.MODERATE, count: "100 / 639",
    summary: "London Close kill zone tail — the session high / low is often already set.",
    checklist: [
      "London Close kill zone (10:00–noon) tail — if the morning move hasn't completed, watch for a reversal into lunch.",
      "Session high / low frequently already established — fade extensions back toward the dealing range.",
    ],
  },
  {
    id: "lunch", name: "NY Lunch / Lunch Macro", time: "11:30 AM–1:30 PM", start: 690, end: 810,
    corr: CORRELATION.MODERATE, count: "100 / 639",
    summary: "~2-hour lower-volatility consolidation; the lunch macro often starts at 11:30.",
    checklist: [
      "Lunch moves are lower quality and more prone to reversing once the PM session opens at 1:30 — generally fade, don't chase.",
      "Lunch macro can start right at 11:30 — expect a 20-min delivery, then chop.",
      "Stand down or trade small until the PM session opens.",
    ],
  },
  {
    id: "pmopen", name: "PM Session", time: "1:30–2:50 PM", start: 810, end: 890,
    corr: CORRELATION.MODERATE, count: "100 / 639",
    summary: "PM session open at 1:30 — lunch moves often reverse or continue into this window.",
    checklist: [
      "1:30 PM PM session open — acts as a smaller second opening range; watch for the PM directional leg.",
      "Lunch moves frequently reverse or continue here — read the reaction, don't force.",
      "Stand down as the final-hour macro approaches at 2:50 unless a clean setup forms.",
    ],
  },
  {
    id: "finalmacro", name: "Final-Hour Macro", time: "2:50–3:10 PM", start: 890, end: 910,
    corr: CORRELATION.MODERATE, count: "136 / 639",
    summary: "Late-day 20-minute delivery window — last meaningful push before the close.",
    checklist: [
      "Final-hour macro — prime window for a late-day continuation or reversal into settlement.",
      "Watch for the last directional push before the 4:00–4:14 PM close.",
    ],
  },
  {
    id: "close", name: "Regular Session Close", time: "3:10–5:00 PM", start: 910, end: 1020,
    corr: CORRELATION.NOTED, count: "43 / 639",
    summary: "Last print at 4:14 PM becomes tomorrow's ORG anchor; 5:00 PM settlement.",
    checklist: [
      "Mark today's 4:14 PM settlement — it becomes tomorrow's Opening Range Gap anchor.",
      "Avoid initiating new swing setups this late unless catching the close push; size down.",
      "5:00 PM futures session close / settlement before the short overnight pause.",
    ],
  },
  {
    id: "reopen", name: "Futures Reopen / New Day", time: "5:00–8:00 PM", start: 1020, end: 1200,
    corr: CORRELATION.MODERATE, count: "154 / 639",
    summary: "6:00 PM futures reopen begins the new day's opening gap.",
    checklist: [
      "Futures reopen at 6:00 PM ET begins the new day's opening gap.",
      "On Sunday this prints the weekly opening price — carry it all week as the premium / discount anchor.",
      "Liquidity is thin overnight — read, don't press.",
    ],
  },
  {
    id: "asian", name: "Asian Range", time: "8:00 PM–midnight", start: 1200, end: 1440,
    corr: CORRELATION.NOTED, count: "—",
    summary: "Builds the range London / New York later expand away from; often faded, not chased.",
    checklist: [
      "Asian range builds the range that London and New York later expand away from.",
      "Generally fade Asian extremes, don't chase — the range is often swept later.",
      "Low-reliability overnight data — use it to map levels, not to trade size.",
    ],
  },
];

export const SEASONS = [
  {
    key: "winter", name: "Winter", months: ["December", "January", "February"],
    note: "Late Dec–early Jan brings thin holiday liquidity. ICT's stated rule: after a holiday, size down to a single contract / paper-trade until normal volume returns. January often establishes new yearly reference ranges.",
    corr: CORRELATION.NOTED, caveat: "Limited archive support — treat as context, not a trade signal.",
  },
  {
    key: "spring", name: "Spring", months: ["March", "April", "May"],
    note: "No month-specific edge appears in the 639-transcript archive for index futures. Rely on day-of-week and time-of-day; treat the season as neutral.",
    corr: CORRELATION.RARE, caveat: "No archive support for a spring seasonal rule.",
  },
  {
    key: "summer", name: "Summer", months: ["June", "July", "August"],
    note: "Summer is widely associated with thinner, choppier index liquidity in general trading lore, but the archive does not call out a specific summer rule. Treat as neutral; size down if ranges compress.",
    corr: CORRELATION.RARE, caveat: "General lore only — not archive-backed.",
  },
  {
    key: "fall", name: "Fall", months: ["September", "October", "November"],
    note: "Sep / Oct are commonly cited as weaker, choppier months for index futures; November sometimes prints a seasonal low. Thanksgiving week (late Nov) = thin holiday liquidity → size down per the holiday rule. Archive support is thin.",
    corr: CORRELATION.NOTED, caveat: "Limited archive support — treat as context, not a trade signal.",
  },
];

export const VOCABULARY = [
  { term: "Liquidity", rank: 1, note: "The single most-used concept — where stop pools rest." },
  { term: "Fair Value Gap (FVG)", rank: 2, note: "Imbalance / inefficiency price returns to fill." },
  { term: "Order Block", rank: 3, note: "Last opposing candle before a displacement; institutional entry." },
  { term: "Premium / Discount", rank: 4, note: "Above or below the dealing-range midpoint — defines bias." },
  { term: "Relative Equal Highs / Lows", rank: 5, note: "Liquidity targets price returns to sweep." },
  { term: "Consequent Encroachment", rank: 6, note: "Gap / range midpoint — near-inevitable early magnet (216 / 639)." },
  { term: "OTE (Optimal Trade Entry)", rank: 7, note: "Fib 0.62–0.79 entry zone within a leg." },
  { term: "PD Array", rank: 8, note: "Stacked draw on liquidity — premium/discount + order flow." },
  { term: "Breaker Block", rank: 9, note: "Failed order block that flips to support/resistance." },
];

export const WEEKLY_RHYTHM = [
  { day: "Mon", text: "Mark the day's high / low — the week's first liquidity references. Post-holiday Monday = trade small." },
  { day: "Tue", text: "Watch for Mon / Tue highs or lows being swept — often where the week's true high / low prints." },
  { day: "Wed", text: "FOMC day — expect a two-stage move (false push, then real leg). Wednesday reversal template." },
  { day: "Thu", text: "Pre-NFP manipulation day; 'Thursday reversal' profile. NFP week: no new setups after 11 AM Wed." },
  { day: "Fri", text: "NFP (first Friday, 8:30 AM) + week's liquidity target. Expect ~20–30% 'TGIF' retracement after a strong week." },
  { day: "Sun", text: "6:00 PM futures reopen prints the weekly opening price — carry it all week." },
  { day: "Sat", text: "Market closed — review and plan." },
];

export const DAILY_RHYTHM = [
  { time: "4:14 PM", text: "Prior close. Compare tomorrow's 9:30 open to this to classify the ORG (premium / discount)." },
  { time: "6:00 PM", text: "Futures reopen / new day (week's open on Sunday)." },
  { time: "Midnight", text: "True day open — Judas-swing reference: watch for a false move away from this price." },
  { time: "1:00–5:00 AM", text: "London Kill Zone — often where the day's real directional move starts." },
  { time: "7:00–10:00 AM", text: "NY Open Kill Zone, including the 9:30 open and first 30–60 minutes." },
  { time: "9:50–10:10 AM", text: "AM macro / Silver Bullet window (first FVG after 10:00)." },
  { time: "10:30 AM", text: "First-hour range locks in; algorithmic activity picks up." },
  { time: "11:30 AM–1:30 PM", text: "NY Lunch — lower-quality moves, generally faded." },
  { time: "2:50–3:10 PM", text: "Final-hour macro — last push before the close." },
  { time: "4:00–4:14 PM", text: "Regular session close — tomorrow's ORG anchor." },
];

// ICT handling for each USD high-impact (red-folder) release type.
// Aliases are lowercased substrings matched against the event title; order matters.
export const NEWS_PLAYBOOK = [
  {
    key: "nfp", short: "NFP", title: "Non-Farm Payrolls (NFP)", time: "First Friday · 8:30 AM ET",
    aliases: ["nonfarm", "non-farm", "nfp", "unemployment rate"],
    corr: CORRELATION.STRONG,
    handling: "Highest manipulation of the month — let the first spike retrace before committing; the real leg targets the week's built liquidity.",
    summary: "The marquee USD release. ICT treats NFP week with a stand-down rule and reads the report's two-stage reaction.",
    checklist: [
      "Stand-down rule: no new setups after 11:00 AM ET Wednesday until the Friday 8:30 AM print lands.",
      "Don't trade the first candle — the initial spike is frequently a Judas move that fully retraces into the news-window origin.",
      "Let the 1- to 5-minute reaction resolve; the real directional leg usually begins after the first sweep retraces.",
      "Draw on liquidity: price typically targets the prior session / week's high or low after the dust settles.",
      "Size down — trading the NFP expansion is a gamble, not a setup; prefer the post-reaction continuation.",
    ],
  },
  {
    key: "cpi", short: "CPI", title: "Consumer Price Index (CPI)", time: "Monthly · 8:30 AM ET",
    aliases: ["cpi", "consumer price"],
    corr: CORRELATION.STRONG,
    handling: "Two-stage: the initial spike retraces into the print-window FVG before the real bias leg — don't chase candle one.",
    summary: "Inflation print that can lock in the day's bias when it deviates from forecast. Two-stage reaction, similar to NFP.",
    checklist: [
      "Two-stage reaction: initial spike, retracement toward the news-window origin / FVG, then the real leg.",
      "Don't chase the first candle — wait for the retracement and read direction off the 5-minute close.",
      "A hot / cold surprise sets the session bias; align new entries with premium / discount relative to the daily open.",
      "Flatten before the print unless the position is a planned part of the reaction trade.",
    ],
  },
  {
    key: "pce", short: "PCE", title: "Core PCE Price Index", time: "Monthly · 8:30 AM ET",
    aliases: ["pce", "personal consumption"],
    corr: CORRELATION.MODERATE,
    handling: "The Fed's preferred inflation gauge — a cleaner two-stage than CPI; same wait-for-retrace discipline.",
    summary: "The Fed's preferred inflation gauge. Often a cleaner, slightly smaller reaction than CPI.",
    checklist: [
      "Treat like CPI but expect a slightly tamer, cleaner reaction.",
      "Wait for the initial spike to retrace into the origin before reading direction.",
      "Watch for the session high / low to form shortly after the retrace resolves.",
    ],
  },
  {
    key: "fomc_minutes", short: "FOMC Min", title: "FOMC Meeting Minutes", time: "3 weeks after each meeting · 2:00 PM ET",
    aliases: ["minutes"],
    corr: CORRELATION.MODERATE,
    handling: "Lower intensity than the decision — read context, don't force; let the 2 PM spike settle.",
    summary: "Released three weeks after each FOMC meeting. Lower volatility than the rate decision — context, not a trade trigger.",
    checklist: [
      "Lower intensity than the rate decision — don't expect an NFP-sized move.",
      "Let the 2:00 PM spike settle; the real read comes after the initial reaction retraces.",
      "Use the tone (hawkish / dovish revision) as context for the next session's bias, not as an immediate trigger.",
    ],
  },
  {
    key: "fomc", short: "FOMC", title: "FOMC Rate Decision", time: "8×/year · 2:00 PM ET, presser 2:30 PM",
    aliases: ["fomc", "rate decision", "federal funds", "interest rate"],
    corr: CORRELATION.STRONG,
    handling: "Statement + presser are two separate bursts — the presser often reverses the statement move; stand down through both.",
    summary: "The statement spike and the Powell press conference are two distinct volatility bursts. The presser frequently fades the statement move.",
    checklist: [
      "Two separate bursts: the 2:00 PM statement and the 2:30 PM presser — do not assume the first move is the real one.",
      "Stand down through both; the presser often reverses the statement's initial direction.",
      "Only act after the presser settles and a clear draw on liquidity forms.",
      "Hold-through is a gamble — flatten before 2:00 PM unless the position is a planned reaction trade.",
    ],
  },
  {
    key: "gdp", short: "GDP", title: "GDP (Advance / Second / Third)", time: "Quarterly · 8:30 AM ET",
    aliases: ["gdp", "gross domestic"],
    corr: CORRELATION.NOTED,
    handling: "Lagging print — the reaction is usually smaller and often fades; lower priority, don't force.",
    summary: "Backward-looking, lagging data. Reaction is typically smaller and prone to fading.",
    checklist: [
      "Reaction is usually smaller and often fades — lower priority than CPI / NFP / PCE.",
      "Don't force a trade; use it as context for the existing daily bias.",
      "If a move prints, watch for it to reverse back into the prior range.",
    ],
  },
  {
    key: "retail", short: "Retail", title: "Retail Sales", time: "Monthly · 8:30 AM ET",
    aliases: ["retail sales"],
    corr: CORRELATION.MODERATE,
    handling: "Consumer-spending gauge — can set the morning bias; same two-stage, smaller amplitude.",
    summary: "Consumer spending gauge. Can set the early-session bias; smaller amplitude than the inflation prints.",
    checklist: [
      "Can set the morning bias when it surprises — align with the daily open's premium / discount.",
      "Two-stage but smaller — wait for the initial spike to retrace before committing.",
      "Don't size up; treat as a routine release, not a marquee event.",
    ],
  },
  {
    key: "ism", short: "ISM / PMI", title: "ISM Manufacturing / Services PMI", time: "Monthly · 10:00 AM ET (Mfg on first business day)",
    aliases: ["ism", "pmi"],
    corr: CORRELATION.MODERATE,
    handling: "A 10:00 AM sentiment release — can drive the late-morning leg; let the Silver Bullet window settle first.",
    summary: "Business sentiment. Released at 10:00 AM — overlaps the AM Silver Bullet / macro window and can drive the late-morning leg.",
    checklist: [
      "Released at 10:00 AM — overlaps the Silver Bullet window; let the macro settle before reading the release.",
      "Can drive the late-morning directional leg when it deviates from forecast.",
      "Two-stage — wait for the initial reaction to retrace into the 10:00 hour origin.",
    ],
  },
  {
    key: "claims", short: "Claims", title: "Initial / Continuing Jobless Claims", time: "Weekly · Thursday 8:30 AM ET",
    aliases: ["jobless claims", "initial claims", "continuing claims"],
    corr: CORRELATION.NOTED,
    handling: "Weekly noise — a moderate reaction; only matters as context near NFP / FOMC.",
    summary: "Weekly labor noise. Reaction is moderate and only relevant as context ahead of NFP or FOMC.",
    checklist: [
      "Weekly noise — the reaction is moderate and often fades.",
      "Only matters as context when it lands near NFP week or ahead of FOMC.",
      "Don't build a trade around it; let it pass and read the existing structure.",
    ],
  },
  {
    key: "confidence", short: "Confidence", title: "Consumer Confidence / Sentiment", time: "Monthly (CB / UoM) · 10:00 AM or 9:55 AM ET",
    aliases: ["consumer confidence", "consumer sentiment", "univ. of michigan"],
    corr: CORRELATION.NOTED,
    handling: "A moderate sentiment print — fades often; don't chase, use as bias context.",
    summary: "Consumer sentiment gauges (Conference Board, University of Michigan). Moderate reactions that often fade.",
    checklist: [
      "Moderate reaction — frequently fades back into the prior range.",
      "Use as context for the existing bias, not as a standalone trigger.",
      "Don't chase the first candle; wait for the retracement.",
    ],
  },
];

export const SOURCE_NOTE =
  "Built from 639 parsed ICT video transcripts (session reviews, mentorship lectures, and forex / futures price-action lessons). Correlation counts reflect explicit term / time-stamp matches across that transcript set — not ICT's full body of work, and not a guarantee of future market behavior.";

export type GuideNewsEvent = { title: string; country?: string; currency: string; date: string; time: string; impact: string; forecast?: string; previous?: string; actual?: string; isoDate?: string };

// ---- helpers ----

export function getETParts(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => (map[p.type] = p.value));
  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(map.minute, 10);
  const second = parseInt(map.second, 10);
  return {
    weekday: map.weekday,
    weekdayKey: map.weekday.toLowerCase(),
    month: map.month,
    day: parseInt(map.day, 10),
    year: parseInt(map.year, 10),
    hour, minute, second,
    minutesOfDay: hour * 60 + minute,
    clock: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`,
  };
}

export function getWindowForMinutes(mins: number) {
  return TIME_WINDOWS.find((w) => mins >= w.start && mins < w.end) || TIME_WINDOWS[0];
}

export function getSeasonForMonth(monthName: string) {
  return SEASONS.find((s) => s.months.includes(monthName)) || SEASONS[1];
}

export function getDay(weekdayKey: string) {
  return DAYS[weekdayKey as keyof typeof DAYS] || DAYS.monday;
}

export function isMarketClosed(weekdayKey: string, minutesOfDay: number) {
  if (weekdayKey === "saturday") return true;
  if (weekdayKey === "sunday" && minutesOfDay < 18 * 60) return true; // reopen 6 PM
  return false;
}

export function isNfpFriday(weekdayKey: string, dayOfMonth: number) {
  return weekdayKey === "friday" && dayOfMonth <= 7;
}

// Build the combined "right now" guidance.
export function buildRightNow({ etParts, window, day, season, newsEvents, isClosed }: { etParts: ReturnType<typeof getETParts>; window: typeof TIME_WINDOWS[number]; day: typeof DAYS[keyof typeof DAYS]; season: typeof SEASONS[number]; newsEvents: GuideNewsEvent[]; isClosed: boolean }) {
  if (isClosed) {
    return {
      title: "Markets are closed",
      summary: "It's the weekend in New York. Futures reopen ~6:00 PM ET Sunday with the week's opening price.",
      checklist: [
        "Review the prior week's structure — mark the weekly high / low and the weekly open.",
        "Plan your weekly bias: above the weekly open favors longs, below it favors shorts.",
        "Set alerts on Monday's high / low once the new week opens — they become the first liquidity references.",
      ],
      corr: CORRELATION.MODERATE,
      warnings: [],
    };
  }

  const checklist = [...window.checklist];
  const warnings: { kind: string; text: string }[] = [];

  // Day-specific items (top, most actionable for the day).
  const dayItems = day.lookFor.filter(
    (l) => !checklist.includes(l)
  );
  // Insert the most relevant day item near the top.
  if (dayItems[0]) checklist.splice(1, 0, dayItems[0]);

  const todayEvents = (newsEvents || []).filter((e) => isToday(e, etParts));

  // NFP / FOMC contextual warnings.
  if (todayEvents.some((event) => /non.?farm|nfp/i.test(event.title))) {
    warnings.push({
      kind: "NFP",
      text: "NFP is listed today. Elevated manipulation is possible; let the initial reaction resolve before committing size.",
    });
  }
  if (todayEvents.some((event) => /fomc|federal funds|rate decision/i.test(event.title))) {
    warnings.push({
      kind: "FOMC",
      text: "A Fed decision is listed today. Expect a possible two-stage move; don't assume the first move is the real one.",
    });
  }
  if (newsEvents.some((event) => /non.?farm|nfp/i.test(event.title)) && (etParts.weekdayKey === "thursday" || etParts.weekdayKey === "friday")) {
    warnings.push({
      kind: "NFP week",
      text: "Thu / Fri of NFP week = higher manipulation. Rule: stand down on new setups after 11:00 AM Wed until the Friday 8:30 AM report prints.",
    });
  }

  // News warnings (high-impact events).
  const upcoming = (newsEvents || [])
    .filter((e) => isUpcoming(e, etParts))
    .slice(0, 1);
  if (todayEvents.length) {
    todayEvents.forEach((e) => {
      warnings.push({
        kind: "Red-folder news",
        text: `High-impact today: ${e.title} (${e.time || "All Day"} ET${e.currency ? ", " + e.currency : ""}). Expect a two-stage reaction — let the initial move resolve before committing size.`,
      });
      const pb = matchNewsPlaybook(e);
      if (pb) {
        warnings.push({ kind: pb.short, text: `${pb.title} playbook: ${pb.handling}` });
      }
    });
  } else if (upcoming.length) {
    upcoming.forEach((e) =>
      warnings.push({
        kind: "Red-folder news",
        text: `Next high-impact: ${e.title} — ${e.date} ${e.time || ""} ET${e.currency ? " (" + e.currency + ")" : ""}.`,
      })
    );
  }

  // Season as a context line (weakest-backed dimension).
  const seasonLine = `Season — ${season.name}: ${season.note}`;

  return {
    title: `${window.name} — ${window.time}`,
    summary: window.summary,
    checklist,
    corr: window.corr,
    warnings,
    seasonLine,
    dayContext: `${day.name}: ${day.role}`,
  };
}

function parseNewsDate(dateStr: string) {
  // ForexFactory date format: "MM-DD-YYYY"
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  return { month: parseInt(m[1], 10), day: parseInt(m[2], 10), year: parseInt(m[3], 10) };
}

function isToday(e: GuideNewsEvent, etParts: ReturnType<typeof getETParts>) {
  const d = parseNewsDate(e.date);
  if (!d) return false;
  // ET month is a name; map to number.
  const monthNum = monthNameToNum(etParts.month);
  return d.day === etParts.day && d.month === monthNum;
}

function isUpcoming(e: GuideNewsEvent, etParts: ReturnType<typeof getETParts>) {
  const d = parseNewsDate(e.date);
  if (!d) return false;
  const monthNum = monthNameToNum(etParts.month);
  // upcoming = today (later) or after today this week
  const eventDate = new Date(d.year, d.month - 1, d.day).getTime();
  const today = new Date(etParts.year, monthNum - 1, etParts.day).getTime();
  return eventDate > today;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
function monthNameToNum(name: string) {
  return MONTH_NAMES.indexOf(name) + 1;
}

// Match a news event to a USD playbook entry (USD only). Returns the entry or null.
export function matchNewsPlaybook(event: GuideNewsEvent) {
  if (!event || (event.currency || "").toUpperCase() !== "USD") return null;
  const t = (event.title || "").toLowerCase();
  if (!t) return null;
  for (const entry of NEWS_PLAYBOOK) {
    if (entry.aliases.some((a) => t.includes(a))) return entry;
  }
  return null;
}