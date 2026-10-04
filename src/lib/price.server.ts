// Server-only price lookup + auto-verification helpers.

export type PriceProvider = "binance" | "twelvedata";

export type PriceMatch = {
  provider: PriceProvider;
  symbol: string;
  price: number;
};

function cleanAsset(asset: string): string {
  return asset.trim().toUpperCase();
}

function binanceCandidates(asset: string): string[] {
  const a = cleanAsset(asset).replace(/[\s\-_]/g, "");
  const base = a.replace(/\//g, "");
  const out = new Set<string>();
  out.add(base);
  if (!/USDT$|USDC$|USD$|BUSD$/.test(base)) {
    out.add(`${base}USDT`);
    out.add(`${base}USD`);
  }
  if (base.endsWith("USD") && !base.endsWith("BUSD")) {
    out.add(`${base.slice(0, -3)}USDT`);
  }
  if (base.endsWith("PERP")) out.add(base.replace(/PERP$/, "USDT"));
  return [...out].filter((s) => /^[A-Z0-9]{5,20}$/.test(s)).slice(0, 5);
}

async function binancePrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { price?: string };
    const n = Number(json.price);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function twelveDataCandidates(asset: string): string[] {
  const a = cleanAsset(asset).replace(/\s/g, "");
  const out = new Set<string>();
  out.add(a);
  const noSlash = a.replace(/\//g, "");
  if (/^[A-Z]{6}$/.test(noSlash)) out.add(`${noSlash.slice(0, 3)}/${noSlash.slice(3)}`);
  if (/^[A-Z]{3}\/[A-Z]{3}$/.test(a)) out.add(a);
  return [...out].filter(Boolean).slice(0, 4);
}

async function twelveDataPrice(symbol: string): Promise<number | null> {
  const apiKey = process.env["TWELVE_DATA_API_KEY"];
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { price?: string; code?: number };
    const n = Number(json.price);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/** Try Binance first (crypto), then Twelve Data (forex/stocks). Null = self-reported. */
export async function matchPriceSymbol(asset: string | null): Promise<PriceMatch | null> {
  if (!asset || cleanAsset(asset) === "UNKNOWN") return null;

  for (const symbol of binanceCandidates(asset)) {
    const price = await binancePrice(symbol);
    if (price !== null) return { provider: "binance", symbol, price };
  }
  for (const symbol of twelveDataCandidates(asset)) {
    const price = await twelveDataPrice(symbol);
    if (price !== null) return { provider: "twelvedata", symbol, price };
  }
  return null;
}

export async function currentPrice(
  provider: string,
  symbol: string,
): Promise<number | null> {
  if (provider === "binance") return binancePrice(symbol);
  if (provider === "twelvedata") return twelveDataPrice(symbol);
  return null;
}

/** Grade every due auto-verifiable prediction. Returns a small summary. */
export async function gradePendingPredictions(): Promise<{
  checked: number;
  graded: number;
  skipped: number;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("predictions")
    .select("id, price_provider, price_symbol, price_at_prediction, prediction_short")
    .not("price_provider", "is", null)
    .is("outcome", null)
    .lte("resolve_at", new Date().toISOString())
    .limit(100);

  if (error) throw new Error(error.message);

  let graded = 0;
  let skipped = 0;
  const rows = data ?? [];

  for (const row of rows) {
    const start = Number(row.price_at_prediction);
    if (!row.price_provider || !row.price_symbol || !Number.isFinite(start) || start <= 0) {
      skipped++;
      continue;
    }
    const now = await currentPrice(row.price_provider, row.price_symbol);
    if (now === null) {
      skipped++;
      continue;
    }
    const changePct = ((now - start) / start) * 100;
    const actual =
      changePct > 0.05 ? "UP" : changePct < -0.05 ? "DOWN" : "SIDEWAYS";
    if (actual === "SIDEWAYS") {
      skipped++;
      continue;
    }
    const predicted = (row.prediction_short ?? "").toUpperCase();
    if (predicted !== "UP" && predicted !== "DOWN") {
      skipped++;
      continue;
    }
    const outcome = predicted === actual ? "correct" : "wrong";
    const { error: updErr } = await supabaseAdmin
      .from("predictions")
      .update({
        outcome,
        price_at_resolution: now,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (updErr) skipped++;
    else graded++;
  }

  return { checked: rows.length, graded, skipped };
}
