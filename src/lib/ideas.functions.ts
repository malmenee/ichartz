import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SYSTEM_PROMPT = `
You are an elite intraday price-action strategist. The user has already run a
multi-timeframe chart analysis and you are given:
- the asset,
- the long-term and short-term bias (with confidence & reasoning) previously
  produced from their uploaded charts,
- the timeframes they uploaded,
- upcoming RED-FOLDER (high-impact) news events.

Also, you are given the ACTUAL chart images. Read them again for fresh levels.

Produce a DAY-PLAN that is fully consistent with the prior bias unless the
charts clearly contradict it (then explain the conflict and lower confidence).

You are also given ICT PULSE CONTEXT: defined kill zones (ET), the day-of-week
behaviour, the season and red-folder news windows. Every trade idea MUST name
one defined kill zone, give a window_et fully inside it, and avoid every news
window (no entries within 15 minutes of a red-folder event).

You MUST factor in the red-folder news:
- Avoid entries in the ~15 min window around each red event.
- Anticipate volatility, liquidity sweeps, and fakeouts around them.
- Prefer post-news continuation once direction confirms.

Return STRICT JSON ONLY (no markdown), shape:
{
  "asset": "<ticker>",
  "aligned_with_prior_bias": true | false,
  "session_bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "key_levels": [{ "label": "<name>", "price": "<value>" }],
  "timeframe_focus": [
    { "timeframe": "<1D|4H|1H|15m|1m>", "role": "<bias|structure|trigger>", "note": "<1 sentence>" }
  ],
  "best_windows": [
    { "time_utc": "HH:MM-HH:MM", "session": "Asia|London|NY|London-NY Overlap", "why": "<1 sentence>" }
  ],
  "what_to_look_for": ["<setup 1>", "<setup 2>", "<setup 3>"],
  "trade_ideas": [
    {
      "direction": "LONG" | "SHORT",
      "entry_zone": "<price/condition>",
      "invalidation": "<price/condition>",
      "targets": ["<t1>", "<t2>"],
      "confidence": <0-100>,
      "rationale": "<2-3 sentences tying PA + news + prior bias>",
      "kill_zone": "<exact name of one defined kill zone>",
      "window_et": "HH:MM-HH:MM (Eastern Time, must sit inside that kill zone)",
      "entry_conditions": ["<condition 1>", "<condition 2>"],
      "stand_aside_when": ["<condition 1>", "<condition 2>"]
    }
  ],
  "news_watch": [
    { "time_utc": "HH:MM", "event": "<name>", "impact": "High", "playbook": "<how to trade around it>" }
  ],
  "risk_notes": "<1-2 sentences>"
}
`.trim();

export const getTradeIdeas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      predictionId: z.string().uuid(),
      style: z.enum(["scalp", "intraday", "swing"]).default("intraday"),
    }),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { error: "Missing LOVABLE_API_KEY", result: null };

    const { data: pred, error: predErr } = await context.supabase
      .from("predictions")
      .select("*")
      .eq("id", data.predictionId)
      .maybeSingle();
    if (predErr || !pred) {
      return { error: "Prediction not found", result: null };
    }

    const images =
      (pred.images as { timeframe: string; url: string }[] | null) ??
      (pred.image_url
        ? [{ timeframe: "?", url: pred.image_url as string }]
        : []);
    if (images.length === 0) {
      return { error: "No chart images on this prediction", result: null };
    }

    const { spendCredit, refundCredit, NO_CREDITS_ERROR } = await import("./credits.server");
    const remaining = await spendCredit(context.userId, "trade idea");
    if (remaining == null) return { error: NO_CREDITS_ERROR, result: null };
    try {
      const out = await buildIdea();
      if (out.error) await refundCredit(context.userId, "trade idea failed");
      return out;
    } catch (e) {
      await refundCredit(context.userId, "trade idea failed");
      throw e;
    }

    async function buildIdea() {
    const p = pred!;
    const asset = pred!.asset ?? "Unknown";
    const { getPulseContext, pulseContextPrompt, assessIdeaWindow } = await import("./pulse-context.server");
    const now = new Date();
    const ctx = await getPulseContext(now, asset);
    const news = ctx.newsWindows;

    const longP = p.prediction_long ?? p.prediction ?? "?";
    const longC = p.confidence_long ?? p.confidence ?? 0;
    const longR = p.reasoning_long ?? p.reasoning ?? "";
    const shortP = p.prediction_short ?? "?";
    const shortC = p.confidence_short ?? 0;
    const shortR = p.reasoning_short ?? "";
    const tfs = images.map((i) => i.timeframe).join(", ");

    const userText = `Asset: ${asset}
Style: ${data.style}
Current UTC time: ${new Date().toISOString()}
Uploaded timeframes: ${tfs}

PRIOR ANALYSIS (from this user's chart upload):
- Long-term: ${longP} (${longC}%) — ${longR}
- Short-term: ${shortP} (${shortC}%) — ${shortR}

${pulseContextPrompt(ctx)}

Look at the attached charts and build the day-plan. Times in JSON must be UTC.`;

    const content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [{ type: "text", text: userText }];
    for (const img of images) {
      content.push({ type: "text", text: `Timeframe: ${img.timeframe}` });
      content.push({ type: "image_url", image_url: { url: img.url } });
    }

    const res = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429)
        return { error: "Rate limit hit. Retry shortly.", result: null };
      if (res.status === 402)
        return { error: "AI credits exhausted.", result: null };
      return {
        error: `AI error ${res.status}: ${txt.slice(0, 200)}`,
        result: null,
      };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.trade_ideas)) {
        parsed.trade_ideas = parsed.trade_ideas.map((idea: Record<string, unknown>) => ({
          ...idea,
          ...assessIdeaWindow(idea.window_et, ctx, now),
        }));
      }
      const { error: saveError } = await context.supabase.from("trade_ideas").insert({
        user_id: context.userId,
        prediction_id: data.predictionId,
        style: data.style,
        plan: parsed,
        news_count: news.length,
      });
      if (saveError) return { error: "Your plan was created but could not be saved.", result: null };
      return {
        error: null,
        result: parsed,
        newsCount: news.length,
        prediction: {
          asset,
          long: { prediction: longP, confidence: longC },
          short: { prediction: shortP, confidence: shortC },
          timeframes: images.map((i) => i.timeframe),
        },
      };
    } catch {
      return { error: "AI returned invalid JSON.", result: null };
    }
    }
  });
