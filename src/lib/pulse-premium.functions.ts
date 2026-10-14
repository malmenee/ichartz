import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export function isPulseActive(row: { subscription_status: string | null; current_period_end: string | null } | null, now = new Date()) {
  if (!row) return false;
  if (row.subscription_status !== "active" && row.subscription_status !== "trialing") return false;
  return !row.current_period_end || new Date(row.current_period_end) > now;
}

/** Returns premium ICT Pulse guide content only for users with an active subscription. */
export const getPulsePremium = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("entitlements")
      .select("subscription_status, current_period_end")
      .eq("user_id", context.userId)
      .eq("product", "ict_pulse")
      .maybeSingle();
    if (!isPulseActive(data)) return { active: false as const, content: null };
    const m = await import("./ict-premium.server");
    return {
      active: true as const,
      content: {
        vocabulary: m.VOCABULARY,
        weekly: m.WEEKLY_RHYTHM,
        daily: m.DAILY_RHYTHM,
        playbook: m.NEWS_PLAYBOOK_DETAILS,
      },
    };
  });

export type LiveIdea = { id: string; asset: string; direction: string; kill_zone: string | null; entry_zone: string | null; window_start: string; window_end: string; pulse_alignment: string | null };

/** Subscriber-only: saved ideas whose window is open now or starts within 2 hours. */
export const getLiveIdeas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: ent } = await context.supabase
      .from("entitlements").select("subscription_status, current_period_end")
      .eq("user_id", context.userId).eq("product", "ict_pulse").maybeSingle();
    if (!isPulseActive(ent)) return { active: false as const, ideas: [] as LiveIdea[] };
    const since = new Date(Date.now() - 3 * 86400000).toISOString();
    const { data } = await context.supabase.from("trade_ideas").select("id, plan, created_at")
      .eq("user_id", context.userId).gte("created_at", since).order("created_at", { ascending: false }).limit(50);
    const now = Date.now();
    const horizon = now + 2 * 3600000;
    const ideas: LiveIdea[] = [];
    for (const row of data ?? []) {
      const plan = row.plan as { asset?: string; trade_ideas?: Record<string, unknown>[] } | null;
      (plan?.trade_ideas ?? []).forEach((t, i) => {
        const ws = typeof t.window_start === "string" ? Date.parse(t.window_start) : NaN;
        const we = typeof t.window_end === "string" ? Date.parse(t.window_end) : NaN;
        if (Number.isNaN(ws) || Number.isNaN(we) || we <= now || ws > horizon) return;
        ideas.push({ id: `${row.id}-${i}`, asset: plan?.asset ?? "?", direction: String(t.direction ?? ""), kill_zone: (t.kill_zone as string) ?? null, entry_zone: (t.entry_zone as string) ?? null, window_start: t.window_start as string, window_end: t.window_end as string, pulse_alignment: (t.pulse_alignment as string) ?? null });
      });
    }
    ideas.sort((a, b) => a.window_start.localeCompare(b.window_start));
    return { active: true as const, ideas };
  });
