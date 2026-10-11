import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const CREDITS_CHANGED = "credits-changed";
export const notifyCreditsChanged = () => window.dispatchEvent(new Event(CREDITS_CHANGED));

export function CreditBadge() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("credit_balances").select("credits").eq("user_id", user.id).maybeSingle();
      setCredits(data ? data.credits : 2);
    };
    load();
    window.addEventListener(CREDITS_CHANGED, load);
    return () => window.removeEventListener(CREDITS_CHANGED, load);
  }, [user]);
  if (!user || credits == null) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
      aria-label={`${credits} credits left`}
    >
      <Coins className="h-3.5 w-3.5 text-primary" />
      {credits} {credits === 1 ? "credit" : "credits"}
    </span>
  );
}
