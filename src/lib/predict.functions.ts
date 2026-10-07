import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TIMEFRAMES = ["1D", "4H", "1H", "15m", "1m"] as const;

const PRICE_ACTION_RULES = `
You are an expert multi-timeframe price-action trader. The user uploads up to 5 chart screenshots
of the SAME asset across different timeframes: 1D (daily), 4H, 1H, 15m, 1m.

Use ONLY pure price action — no indicators. Apply these rules across timeframes:

1. TOP-DOWN BIAS: Establish the LONG-TERM bias from the higher timeframes (1D, 4H).
   - Trend: HH/HL = uptrend, LH/LL = downtrend, mixed = ranging.
   - Mark major support/resistance from prior swing points and consolidation zones.

2. INTERMEDIATE CONTEXT (1H): Where is price within the higher-timeframe structure?
   At a key level, mid-range, or extending? Note any HTF level being tested now.

3. SHORT-TERM TRIGGER (15m, 1m): Use the lowest timeframes for entry-style signals
   — momentum candles, break-and-retest, fakeouts, pin-bar rejections at HTF levels.

4. ALIGNMENT: A high-confidence call requires HTF bias and LTF trigger to agree.
   When they conflict, lower confidence and explain the conflict.

5. REJECTION / FAKEOUTS: Long wicks at key levels = rejection. Wick beyond a level
   that closes back inside = fakeout / reversal.

Return STRICT JSON ONLY (no markdown) with this exact shape:
{
  "asset": "<ticker or 'Unknown'>",
  "long_term": {
    "prediction": "UP" | "DOWN" | "SIDEWAYS",
    "confidence": <integer 0-100>,
    "reasoning": "<2-4 sentences using 1D / 4H structure>"
  },
  "short_term": {
    "prediction": "UP" | "DOWN" | "SIDEWAYS",
    "confidence": <integer 0-100>,
    "reasoning": "<2-4 sentences using 1H / 15m / 1m triggers>"
  },
  "rules_applied": ["<short rule names you used>"]
}
`.trim();

const ImageSchema = z.object({
  timeframe: z.enum(TIMEFRAMES),
  url: z.string().url(),
});

export const FREE_DAILY_ANALYSES = 3;

export function isOwnChartUrl(url: string, supabaseUrl: string, userId: string): boolean {
  try {
    const u = new URL(url);
    const base = new URL(supabaseUrl);
    if (u.protocol !== "https:" || u.host !== base.host) return false;
    const prefixes = [
      `/storage/v1/object/sign/charts/${userId}/`,
      `/storage/v1/object/authenticated/charts/${userId}/`,
    ];
    const path = decodeURIComponent(u.pathname);
    if (path.includes("..")) return false;
    return prefixes.some((p) => path.startsWith(p));
  } catch {
    return false;
  }
}

export const analyzeChart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      images: z.array(ImageSchema).min(1).max(5),
      asset: z.string().max(40).optional(),
      pastFeedback: z
        .array(
          z.object({
            prediction: z.string().max(20),
            outcome: z.string().max(20),
            reasoning: z.string().max(2000).nullable(),
          }),
        )
        .max(10)
        .optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { error: "Missing LOVABLE_API_KEY", result: null };
    }
    const supabaseUrl = process.env.SUPABASE_URL ?? "";
    if (!data.images.every((i) => isOwnChartUrl(i.url, supabaseUrl, context.userId))) {
      return { error: "Images must be your own uploads to chart storage.", result: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ent } = await context.supabase
      .from("entitlements")
      .select("paid")
      .eq("user_id", context.userId)
      .eq("paid", true)
      .limit(1);
    const isPaid = (ent ?? []).length > 0;
    let consumed = false;
    if (!isPaid) {
      const { data: used, error: qErr } = await supabaseAdmin.rpc("consume_analysis_quota", {
        _user_id: context.userId,
        _limit: FREE_DAILY_ANALYSES,
      });
      if (qErr) return { error: "Could not check your daily limit. Try again.", result: null };
      if (used == null) {
        return {
          error: `Daily limit reached: free accounts get ${FREE_DAILY_ANALYSES} analyses per day. Try again tomorrow.`,
          result: null,
          limitReached: true,
        };
      }
      consumed = true;
    }
    try {
      const out = await runAnalysis(data, apiKey, supabaseAdmin);
      if (out.error && consumed) {
        await supabaseAdmin.rpc("refund_analysis_quota", { _user_id: context.userId });
      }
      return out;
    } catch (e) {
      if (consumed) await supabaseAdmin.rpc("refund_analysis_quota", { _user_id: context.userId });
      throw e;
    }
  });

type AnalyzeInput = {
  images: { timeframe: (typeof TIMEFRAMES)[number]; url: string }[];
  asset?: string;
  pastFeedback?: { prediction: string; outcome: string; reasoning: string | null }[];
};

async function runAnalysis(
  data: AnalyzeInput,
  apiKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
) {
  {

    let learningContext = "";
    if (data.pastFeedback && data.pastFeedback.length > 0) {
      const correct = data.pastFeedback.filter((p) => p.outcome === "correct").length;
      const wrong = data.pastFeedback.filter((p) => p.outcome === "wrong").length;
      learningContext =
        `\n\nLEARNING CONTEXT — past track record on this user's charts: ` +
        `${correct} correct, ${wrong} wrong out of ${data.pastFeedback.length} resolved calls. ` +
        `Recent results:\n` +
        data.pastFeedback
          .slice(0, 8)
          .map(
            (p, i) =>
              `${i + 1}. predicted ${p.prediction} → ${p.outcome.toUpperCase()}${
                p.reasoning ? ` (you said: "${p.reasoning.slice(0, 120)}")` : ""
              }`,
          )
          .join("\n") +
        `\nLearn from these mistakes.`;
    }

    let communityContext = "";
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: stats } = await supabaseAdmin.rpc("get_pattern_stats");
      const rows = (stats ?? []).filter((r) => (r.total ?? 0) >= 3);
      if (rows.length > 0) {
        communityContext =
          `\n\nCOMMUNITY TRACK RECORD — historical accuracy of each price-action rule/pattern ` +
          `across all users' resolved calls:\n` +
          rows
            .map(
              (r) =>
                `- "${r.tag}": ${r.wins}/${r.total} correct (${r.win_rate ?? 0}% win rate)`,
            )
            .join("\n") +
          `\nWeight your confidence toward rules with a strong win rate and be more cautious ` +
          `when relying on rules that historically underperform.`;
      }
    } catch {
      // stats are optional — ignore failures
    }

    const provided = data.images.map((i) => i.timeframe).join(", ");
    const userText =
      `Analyze these charts of the SAME asset across timeframes: ${provided}.` +
      `${data.asset ? ` Asset: ${data.asset}.` : ""}` +
      ` Each image is labeled with its timeframe in the message order below.` +
      learningContext +
      communityContext;

    const content: Array<
      { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
    > = [{ type: "text", text: userText }];
    for (const img of data.images) {
      content.push({ type: "text", text: `Timeframe: ${img.timeframe}` });
      content.push({ type: "image_url", image_url: { url: img.url } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: PRICE_ACTION_RULES },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429)
        return { error: "Rate limit hit. Please retry in a moment.", result: null };
      if (res.status === 402)
        return { error: "AI credits exhausted. Add credits in Workspace settings.", result: null };
      return { error: `AI error ${res.status}: ${txt.slice(0, 200)}`, result: null };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    let parsed: {
      asset?: string;
      long_term?: { prediction?: string; confidence?: number; reasoning?: string };
      short_term?: { prediction?: string; confidence?: number; reasoning?: string };
      rules_applied?: string[];
    } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { error: "AI returned invalid JSON. Try again.", result: null };
    }

    const norm = (p?: string) => {
      const v = String(p ?? "").toUpperCase();
      return ["UP", "DOWN", "SIDEWAYS"].includes(v) ? v : null;
    };
    const longP = norm(parsed.long_term?.prediction);
    const shortP = norm(parsed.short_term?.prediction);
    if (!longP || !shortP) {
      return { error: "AI did not return valid predictions.", result: null };
    }
    const clamp = (n?: number) => Math.max(0, Math.min(100, Math.round(n ?? 50)));

    const assetName = parsed.asset ?? data.asset ?? null;

    // Try to attach a live price source so the call can be auto-verified later.
    let verification: {
      price_provider: string;
      price_symbol: string;
      price_at_prediction: number;
      resolve_at: string;
    } | null = null;
    try {
      const { matchPriceSymbol } = await import("./price.server");
      const match = await matchPriceSymbol(assetName);
      if (match) {
        verification = {
          price_provider: match.provider,
          price_symbol: match.symbol,
          price_at_prediction: match.price,
          resolve_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        };
      }
    } catch {
      // price matching is optional — fall back to self-reported outcomes
    }

    return {
      error: null,
      result: {
        asset: assetName,
        verification,
        long_term: {
          prediction: longP,
          confidence: clamp(parsed.long_term?.confidence),
          reasoning: parsed.long_term?.reasoning ?? "",
        },
        short_term: {
          prediction: shortP,
          confidence: clamp(parsed.short_term?.confidence),
          reasoning: parsed.short_term?.reasoning ?? "",
        },
        rules_applied: parsed.rules_applied ?? [],
      },
    };
  });
