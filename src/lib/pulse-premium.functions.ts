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
