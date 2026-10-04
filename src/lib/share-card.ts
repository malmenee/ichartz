// Client-side branded share card renderer (1200x630 PNG via Canvas).

export type ShareCardInput = {
  asset: string | null;
  direction: string | null;
  confidence: number | null;
  imageUrl?: string | null;
};

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export async function renderShareCard(input: ShareCardInput): Promise<Blob | null> {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0b0f17";
  ctx.fillRect(0, 0, W, H);

  if (input.imageUrl) {
    const img = await loadImage(input.imageUrl);
    if (img) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      drawCover(ctx, img, W, H);
      ctx.restore();
    }
  }

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "rgba(11,15,23,0.85)");
  grad.addColorStop(1, "rgba(11,15,23,0.6)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const dir = (input.direction ?? "SIDEWAYS").toUpperCase();
  const accent =
    dir === "UP" ? "#22c55e" : dir === "DOWN" ? "#ef4444" : "#94a3b8";

  // wordmark
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 34px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("ChartSeer", 64, 92);
  ctx.fillStyle = accent;
  ctx.fillRect(64, 112, 96, 4);

  // asset
  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 96px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText((input.asset || "Chart").slice(0, 16), 64, 270);

  // direction badge
  const label = dir === "UP" ? "▲ UP" : dir === "DOWN" ? "▼ DOWN" : "→ SIDEWAYS";
  ctx.font = "700 52px system-ui, -apple-system, Segoe UI, sans-serif";
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = accent;
  const bx = 64;
  const by = 320;
  const bw = tw + 56;
  const bh = 88;
  const r = 20;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
  ctx.arcTo(bx, by + bh, bx, by, r);
  ctx.arcTo(bx, by, bx + bw, by, r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#0b0f17";
  ctx.fillText(label, bx + 28, by + 62);

  // confidence
  if (input.confidence !== null && input.confidence !== undefined) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 30px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Confidence", bx + bw + 48, by + 34);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "700 62px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(`${input.confidence}%`, bx + bw + 48, by + 92);
  }

  // disclaimer
  ctx.fillStyle = "#64748b";
  ctx.font = "400 24px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(
    "AI-generated price-action read — not financial advice",
    64,
    H - 56,
  );

  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/png"),
  );
}

export async function shareOrDownloadCard(input: ShareCardInput) {
  const blob = await renderShareCard(input);
  if (!blob) throw new Error("Could not render the share image.");
  const fileName = `chartseer-${(input.asset || "chart").replace(/[^\w-]/g, "")}.png`;
  const file = new File([blob], fileName, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    navigator.canShare?.({ files: [file] }) &&
    navigator.share
  ) {
    try {
      await navigator.share({ files: [file], title: "ChartSeer read" });
      return "shared" as const;
    } catch {
      // fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded" as const;
}
