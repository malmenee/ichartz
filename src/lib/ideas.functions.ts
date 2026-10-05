import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { fetchRedFolderNews as fetchRedFolderNewsShared, type FFEvent } from "./news-calendar.server";

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
      "rationale": "<2-3 sentences tying PA + news + prior bias>"
    }
  ],
  "news_watch": [
    { "time_utc": "HH:MM", "event": "<name>", "impact": "High", "playbook": "<how to trade around it>" }
  ],
  "risk_notes": "<1-2 sentences>"
}
`.trim();

const fetchRedFolderNews = () => fetchRedFolderNewsShared(48);

// Map an asset string to the currency codes whose red-folder news actually moves it.
function currenciesForAsset(assetRaw: string): string[] {
  const a = (assetRaw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!a) return [];

  if (/(XAU|GOLD)/.test(a)) return ["USD"];
  if (/(XAG|SILVER)/.test(a)) return ["USD"];
  if (/(WTI|BRENT|USOIL|UKOIL|OIL|CL)/.test(a)) return ["USD"];
  if (/(BTC|ETH|SOL|XRP|DOGE|BNB|ADA|USDT|USDC)/.test(a)) return ["USD"];
  if (/(SPX|SP500|ES|NAS|NDX|NQ|DJI|US30|US100|US500|RUT)/.test(a))
    return ["USD"];
  if (/(DAX|GER40|GER30)/.test(a)) return ["EUR"];
  if (/(FTSE|UK100|UK)/.test(a)) return ["GBP"];
  if (/(NIKKEI|JP225|N225)/.test(a)) return ["JPY"];
  if (/(HSI|HK50)/.test(a)) return ["CNY", "HKD"];
  if (/(ASX|AUS200)/.test(a)) return ["AUD"];

  const codes = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF", "CNY"];
  const found = codes.filter((c) => a.includes(c));
  return found;
}

function filterNewsForAsset(events: FFEvent[], asset: string): FFEvent[] {
  const ccys = currenciesForAsset(asset);
  if (ccys.length === 0) return [];
  return events.filter((e) => ccys.includes((e.country || "").toUpperCase()));
}

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

    const asset = pred.asset ?? "Unknown";
    const allNews = await fetchRedFolderNews();
    const news = filterNewsForAsset(allNews, asset);
    const newsBlock = news.length
      ? news
          .map(
            (e) =>
              `- ${e.date} [${e.country}] ${e.title} (impact: ${e.impact}${e.forecast ? `, forecast ${e.forecast}` : ""}${e.previous ? `, prev ${e.previous}` : ""})`,
          )
          .join("\n")
      : `No high-impact events in the next 48h that directly affect ${asset}.`;

    const longP = pred.prediction_long ?? pred.prediction ?? "?";
    const longC = pred.confidence_long ?? pred.confidence ?? 0;
    const longR = pred.reasoning_long ?? pred.reasoning ?? "";
    const shortP = pred.prediction_short ?? "?";
    const shortC = pred.confidence_short ?? 0;
    const shortR = pred.reasoning_short ?? "";
    const tfs = images.map((i) => i.timeframe).join(", ");

    const userText = `Asset: ${asset}
Style: ${data.style}
Current UTC time: ${new Date().toISOString()}
Uploaded timeframes: ${tfs}

PRIOR ANALYSIS (from this user's chart upload):
- Long-term: ${longP} (${longC}%) — ${longR}
- Short-term: ${shortP} (${shortC}%) — ${shortR}

RED-FOLDER NEWS (next 48h, UTC):
${newsBlock}

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
  });
