// Server-only premium guide content. Never import from client code; load via dynamic import in a server function.

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

export const NEWS_PLAYBOOK_DETAILS: Record<string, { summary: string; checklist: string[] }> = {
  nfp: {
    summary: "The marquee USD release. ICT treats NFP week with a stand-down rule and reads the report's two-stage reaction.",
    checklist: [
      "Stand-down rule: no new setups after 11:00 AM ET Wednesday until the Friday 8:30 AM print lands.",
      "Don't trade the first candle — the initial spike is frequently a Judas move that fully retraces into the news-window origin.",
      "Let the 1- to 5-minute reaction resolve; the real directional leg usually begins after the first sweep retraces.",
      "Draw on liquidity: price typically targets the prior session / week's high or low after the dust settles.",
      "Size down — trading the NFP expansion is a gamble, not a setup; prefer the post-reaction continuation.",
    ],
  },
  cpi: {
    summary: "Inflation print that can lock in the day's bias when it deviates from forecast. Two-stage reaction, similar to NFP.",
    checklist: [
      "Two-stage reaction: initial spike, retracement toward the news-window origin / FVG, then the real leg.",
      "Don't chase the first candle — wait for the retracement and read direction off the 5-minute close.",
      "A hot / cold surprise sets the session bias; align new entries with premium / discount relative to the daily open.",
      "Flatten before the print unless the position is a planned part of the reaction trade.",
    ],
  },
  pce: {
    summary: "The Fed's preferred inflation gauge. Often a cleaner, slightly smaller reaction than CPI.",
    checklist: [
      "Treat like CPI but expect a slightly tamer, cleaner reaction.",
      "Wait for the initial spike to retrace into the origin before reading direction.",
      "Watch for the session high / low to form shortly after the retrace resolves.",
    ],
  },
  fomc_minutes: {
    summary: "Released three weeks after each FOMC meeting. Lower volatility than the rate decision — context, not a trade trigger.",
    checklist: [
      "Lower intensity than the rate decision — don't expect an NFP-sized move.",
      "Let the 2:00 PM spike settle; the real read comes after the initial reaction retraces.",
      "Use the tone (hawkish / dovish revision) as context for the next session's bias, not as an immediate trigger.",
    ],
  },
  fomc: {
    summary: "The statement spike and the Powell press conference are two distinct volatility bursts. The presser frequently fades the statement move.",
    checklist: [
      "Two separate bursts: the 2:00 PM statement and the 2:30 PM presser — do not assume the first move is the real one.",
      "Stand down through both; the presser often reverses the statement's initial direction.",
      "Only act after the presser settles and a clear draw on liquidity forms.",
      "Hold-through is a gamble — flatten before 2:00 PM unless the position is a planned reaction trade.",
    ],
  },
  gdp: {
    summary: "Backward-looking, lagging data. Reaction is typically smaller and prone to fading.",
    checklist: [
      "Reaction is usually smaller and often fades — lower priority than CPI / NFP / PCE.",
      "Don't force a trade; use it as context for the existing daily bias.",
      "If a move prints, watch for it to reverse back into the prior range.",
    ],
  },
  retail: {
    summary: "Consumer spending gauge. Can set the early-session bias; smaller amplitude than the inflation prints.",
    checklist: [
      "Can set the morning bias when it surprises — align with the daily open's premium / discount.",
      "Two-stage but smaller — wait for the initial spike to retrace before committing.",
      "Don't size up; treat as a routine release, not a marquee event.",
    ],
  },
  ism: {
    summary: "Business sentiment. Released at 10:00 AM — overlaps the AM Silver Bullet / macro window and can drive the late-morning leg.",
    checklist: [
      "Released at 10:00 AM — overlaps the Silver Bullet window; let the macro settle before reading the release.",
      "Can drive the late-morning directional leg when it deviates from forecast.",
      "Two-stage — wait for the initial reaction to retrace into the 10:00 hour origin.",
    ],
  },
  claims: {
    summary: "Weekly labor noise. Reaction is moderate and only relevant as context ahead of NFP or FOMC.",
    checklist: [
      "Weekly noise — the reaction is moderate and often fades.",
      "Only matters as context when it lands near NFP week or ahead of FOMC.",
      "Don't build a trade around it; let it pass and read the existing structure.",
    ],
  },
  confidence: {
    summary: "Consumer sentiment gauges (Conference Board, University of Michigan). Moderate reactions that often fade.",
    checklist: [
      "Moderate reaction — frequently fades back into the prior range.",
      "Use as context for the existing bias, not as a standalone trigger.",
      "Don't chase the first candle; wait for the retracement.",
    ],
  },
};
