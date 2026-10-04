// Free, no-key economic calendar feed (ForexFactory's public JSON). Shared by
// ideas.functions.ts (per-asset day plan) and pulse.functions.ts (general
// market-wide red-folder panel).

export type FFEvent = {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast?: string;
  previous?: string;
};

export async function fetchRedFolderNews(windowHours = 48): Promise<FFEvent[]> {
  try {
    const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as FFEvent[];
    const now = Date.now();
    const windowEnd = now + windowHours * 60 * 60 * 1000;
    return data
      .filter((e) => e.impact === "High")
      .filter((e) => {
        const t = new Date(e.date).getTime();
        return t >= now - 2 * 60 * 60 * 1000 && t <= windowEnd;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 80);
  } catch {
    return [];
  }
}
