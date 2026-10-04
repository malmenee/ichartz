import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchRedFolderNews } from "./news-calendar.server";
import {
  KILL_ZONES,
  DAY_FOCUS,
  SEASONAL_FRAMING,
  NEWS_PHILOSOPHY,
  getActiveKillZone,
  getDayFocus,
  getQuarterProgress,
} from "./ict-knowledge";

export const getPulse = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const now = new Date();
    const activeKillZone = getActiveKillZone(now);
    const dayFocus = getDayFocus(now);
    const quarter = getQuarterProgress(now);
    const news = await fetchRedFolderNews(72); // next 72h, general market-wide

    return {
      serverTimeUtc: now.toISOString(),
      activeKillZone,
      allKillZones: KILL_ZONES,
      dayFocus,
      allDays: DAY_FOCUS,
      seasonal: SEASONAL_FRAMING,
      quarter,
      newsPhilosophy: NEWS_PHILOSOPHY,
      upcomingNews: news,
    };
  });
