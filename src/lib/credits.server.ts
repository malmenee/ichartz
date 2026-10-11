// Server-only credit helpers. All writes go through service-role SQL functions.
export const NO_CREDITS_ERROR = "No credits left. Buy a credit pack to keep analyzing.";

export async function spendCredit(userId: string, reason: string): Promise<number | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("spend_credit", { _user_id: userId, _reason: reason });
  if (error) throw new Error("Could not check your credits. Try again.");
  return data ?? null;
}

export async function refundCredit(userId: string, reason: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.rpc("add_credits", { _user_id: userId, _delta: 1, _reason: `refund: ${reason}` });
}
