import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { analyzeChart } from "@/lib/predict.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Upload,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  X,
  Loader2,
  LogOut,
  Sparkles,
  ShieldCheck,
  Clock,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { shareOrDownloadCard } from "@/lib/share-card";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [
    { title: "ChartSeer — iChart" },
    { name: "description", content: "Analyze price charts and review your prediction history with ChartSeer." },
    { property: "og:title", content: "ChartSeer — iChart" },
    { property: "og:description", content: "Analyze price charts and review your prediction history with ChartSeer." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AppPage,
});

type Prediction = Tables<"predictions">;
const TIMEFRAMES = ["1D", "4H", "1H", "15m", "1m"] as const;
type TF = (typeof TIMEFRAMES)[number];

function AppPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeChart);

  const [files, setFiles] = useState<Record<TF, File | null>>({
    "1D": null,
    "4H": null,
    "1H": null,
    "15m": null,
    "1m": null,
  });
  const [previews, setPreviews] = useState<Record<TF, string | null>>({
    "1D": null,
    "4H": null,
    "1H": null,
    "15m": null,
    "1m": null,
  });
  const [asset, setAsset] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<Prediction[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) toast.error(error.message);
    else setHistory(data ?? []);
  };

  const onFile = (tf: TF, f: File | null) => {
    setFiles((prev) => ({ ...prev, [tf]: f }));
    setPreviews((prev) => {
      if (prev[tf]) URL.revokeObjectURL(prev[tf]!);
      return { ...prev, [tf]: f ? URL.createObjectURL(f) : null };
    });
  };

  const onSubmit = async () => {
    if (!user) return;
    const entries = (Object.entries(files) as [TF, File | null][]).filter(
      ([, f]) => f !== null,
    ) as [TF, File][];
    if (entries.length === 0) {
      toast.error("Upload at least one chart.");
      return;
    }
    setAnalyzing(true);
    try {
      const uploaded: { timeframe: TF; url: string }[] = [];
      for (const [tf, f] of entries) {
        const ext = f.name.split(".").pop() || "png";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("charts")
          .upload(path, f, { contentType: f.type });
        if (upErr) throw upErr;
        const { data: signed, error: signErr } = await supabase.storage
          .from("charts")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signErr || !signed) throw signErr ?? new Error("Could not read upload");
        uploaded.push({ timeframe: tf, url: signed.signedUrl });
      }

      const resolved = history.filter(
        (h) => h.outcome === "correct" || h.outcome === "wrong",
      );
      const pastFeedback = resolved.slice(0, 10).map((h) => ({
        prediction:
          h.prediction_long ?? h.prediction_short ?? h.prediction ?? "UNKNOWN",
        outcome: h.outcome!,
        reasoning: h.reasoning_long ?? h.reasoning,
      }));

      const { error, result } = await analyze({
        data: {
          images: uploaded,
          asset: asset || undefined,
          pastFeedback,
        },
      });
      if (error || !result) {
        toast.error(error || "Analysis failed");
        return;
      }

      const { error: insErr } = await supabase.from("predictions").insert({
        user_id: user.id,
        image_url: uploaded[0]?.url ?? null,
        images: uploaded,
        asset: result.asset,
        prediction_long: result.long_term.prediction,
        confidence_long: result.long_term.confidence,
        reasoning_long: result.long_term.reasoning,
        prediction_short: result.short_term.prediction,
        confidence_short: result.short_term.confidence,
        reasoning_short: result.short_term.reasoning,
        prediction: result.long_term.prediction, // backward-compat
        confidence: result.long_term.confidence,
        reasoning: result.long_term.reasoning,
        rules_applied: result.rules_applied,
        ...(result.verification ?? {}),
      });
      if (insErr) throw insErr;

      toast.success(
        `Long: ${result.long_term.prediction} (${result.long_term.confidence}%) · Short: ${result.short_term.prediction} (${result.short_term.confidence}%)`,
      );
      // reset
      for (const tf of TIMEFRAMES) onFile(tf, null);
      setAsset("");
      loadHistory();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const setOutcome = async (id: string, outcome: "correct" | "wrong") => {
    const { error } = await supabase
      .from("predictions")
      .update({ outcome, resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Outcome recorded — AI will learn from it.");
      loadHistory();
    }
  };

  const resolved = history.filter(
    (h) => h.outcome === "correct" || h.outcome === "wrong",
  );
  const correct = resolved.filter((h) => h.outcome === "correct").length;
  const accuracy = resolved.length
    ? Math.round((correct / resolved.length) * 100)
    : null;

  const uploadedCount = Object.values(files).filter(Boolean).length;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <LineChart className="h-5 w-5 text-primary" />
            ChartSeer
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/ideas">
              <Button size="sm" variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" /> Premium Ideas
              </Button>
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Upload */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Multi-timeframe analysis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload the same asset across timeframes for top-down price action. Gives
            you both a long-term and short-term call.
          </p>

          <div className="mt-4">
            <Label htmlFor="asset">Asset (optional)</Label>
            <Input
              id="asset"
              placeholder="BTC/USD"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TIMEFRAMES.map((tf) => (
              <TimeframeUpload
                key={tf}
                tf={tf}
                preview={previews[tf]}
                onFile={(f) => onFile(tf, f)}
              />
            ))}
          </div>

          <Button
            className="mt-4 w-full gap-2"
            disabled={uploadedCount === 0 || analyzing}
            onClick={onSubmit}
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Reading {uploadedCount}{" "}
                chart{uploadedCount === 1 ? "" : "s"}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Analyze ({uploadedCount}/5)
              </>
            )}
          </Button>

          <p className="mt-2 text-xs text-muted-foreground">
            Tip: the more timeframes you provide (1D → 1m), the more accurate the
            top-down read.
          </p>

          {accuracy !== null && (
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your AI's accuracy</span>
                <span className="font-semibold">
                  {accuracy}% ({correct}/{resolved.length})
                </span>
              </div>
              <Progress value={accuracy} className="mt-2 h-2" />
            </div>
          )}
        </Card>

        {/* History */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Predictions</h2>
            <Badge variant="secondary">{history.length}</Badge>
          </div>
          {history.length === 0 ? (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              No predictions yet. Upload charts to get started.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {history.map((p) => (
                <PredictionCard key={p.id} p={p} onOutcome={setOutcome} />
              ))}
            </div>
          )}
        </Card>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-8">
        <p className="text-xs text-muted-foreground">
          <strong className="font-semibold">Disclaimer:</strong> ChartSeer is for
          educational and informational purposes only. It is not financial advice
          and should not be relied upon as a basis for any investment or trading
          decision. Markets carry substantial risk of loss. Always do your own
          research and consult a licensed financial advisor before acting.
        </p>
      </footer>
    </div>
  );
}

function TimeframeUpload({
  tf,
  preview,
  onFile,
}: {
  tf: TF;
  preview: string | null;
  onFile: (f: File | null) => void;
}) {
  const id = `file-${tf}`;
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-medium">
        {tf}
      </Label>
      <label
        htmlFor={id}
        className="mt-1 flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-muted/30 transition hover:bg-muted/50"
      >
        {preview ? (
          <img
            src={preview}
            alt={`${tf} chart`}
            className="h-full w-full rounded-md object-contain"
          />
        ) : (
          <>
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Upload</span>
          </>
        )}
        <input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {preview && (
        <button
          type="button"
          onClick={() => onFile(null)}
          className="mt-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          Remove
        </button>
      )}
    </div>
  );
}

function Direction({
  label,
  value,
  confidence,
  reasoning,
}: {
  label: string;
  value: string | null;
  confidence: number | null;
  reasoning: string | null;
}) {
  if (!value) return null;
  const Icon =
    value === "UP" ? TrendingUp : value === "DOWN" ? TrendingDown : Minus;
  const color =
    value === "UP"
      ? "text-chart-2"
      : value === "DOWN"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <div className="rounded border border-border/60 bg-background/40 p-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-sm font-semibold ${color}`}>{value}</span>
        {confidence !== null && (
          <span className="text-xs text-muted-foreground">{confidence}%</span>
        )}
      </div>
      {reasoning && (
        <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
          {reasoning}
        </p>
      )}
    </div>
  );
}

function PredictionCard({
  p,
  onOutcome,
}: {
  p: Prediction;
  onOutcome: (id: string, o: "correct" | "wrong") => void;
}) {
  const images =
    (p.images as { timeframe: string; url: string }[] | null) ??
    (p.image_url ? [{ timeframe: "?", url: p.image_url }] : []);

  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {p.asset && (
          <Badge variant="outline" className="text-xs">
            {p.asset}
          </Badge>
        )}
        {images.map((img, i) => (
          <Badge key={i} variant="secondary" className="text-[10px]">
            {img.timeframe}
          </Badge>
        ))}
      </div>

      {images.length > 0 && (
        <div className="mb-2 flex gap-1 overflow-x-auto">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.timeframe}
              className="h-12 w-20 flex-none rounded object-cover"
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Direction
          label="Long-term"
          value={p.prediction_long ?? p.prediction}
          confidence={p.confidence_long ?? p.confidence}
          reasoning={p.reasoning_long ?? p.reasoning}
        />
        <Direction
          label="Short-term"
          value={p.prediction_short}
          confidence={p.confidence_short}
          reasoning={p.reasoning_short}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(p.created_at).toLocaleString()}
        </span>
        {p.outcome ? (
          <Badge
            variant={p.outcome === "correct" ? "default" : "destructive"}
            className="text-xs"
          >
            {p.outcome === "correct" ? "Correct ✓" : "Wrong ✗"}
          </Badge>
        ) : (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => onOutcome(p.id, "correct")}
            >
              <Check className="h-3 w-3" /> Correct
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => onOutcome(p.id, "wrong")}
            >
              <X className="h-3 w-3" /> Wrong
            </Button>
          </div>
        )}
      </div>

      <Link
        to="/ideas"
        search={{ prediction: p.id }}
        className="mt-3 block"
      >
        <Button size="sm" variant="secondary" className="w-full gap-2">
          <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Get today's trade
          plan
        </Button>
      </Link>
    </div>
  );
}
