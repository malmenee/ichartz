import { createFileRoute } from "@tanstack/react-router";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/resolve-predictions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CRON_SECRET"];
        const provided = request.headers.get("x-cron-secret") ?? "";
        if (!secret || !timingSafeEqual(provided, secret)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { gradePendingPredictions } = await import("@/lib/price.server");
        try {
          const summary = await gradePendingPredictions();
          return Response.json({ ok: true, ...summary });
        } catch (e) {
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});
