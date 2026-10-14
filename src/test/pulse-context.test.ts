import { describe, expect, it } from "vitest";
import { assessIdeaWindow, buildPulseContext, etToUtc, newsWindowsFor, seasonForMonthIndex } from "@/lib/pulse-context.server";

describe("pulse context", () => {
  it("maps every month to exactly one season, December is winter", () => {
    expect(seasonForMonthIndex(11).key).toBe("winter");
    expect(seasonForMonthIndex(0).key).toBe("winter");
    expect(seasonForMonthIndex(2).key).toBe("spring");
    expect(seasonForMonthIndex(8).key).toBe("fall");
  });

  it("is DST-correct for ET", () => {
    expect(etToUtc(2026, 7, 1, 120).toISOString()).toBe("2026-07-01T06:00:00.000Z");
    expect(etToUtc(2026, 1, 15, 120).toISOString()).toBe("2026-01-15T07:00:00.000Z");
  });

  it("finds the current and next kill zone", () => {
    const ctx = buildPulseContext(new Date("2026-10-14T12:00:00Z"), "NQ", []); // 08:00 ET
    expect(ctx.currentKillZone?.id).toBe("ny_am");
    expect(ctx.nextKillZone?.id).toBe("london_close");
  });

  it("drops FOMC events on non-FOMC Wednesdays and adds real FOMC days", () => {
    const fake = [{ title: "FOMC Statement", country: "USD", date: "2026-10-21T14:00:00-04:00", impact: "High" }];
    expect(newsWindowsFor(fake, "NQ", new Date("2026-10-20T12:00:00Z"))).toHaveLength(0);
    const real = newsWindowsFor([], "NQ", new Date("2026-10-27T12:00:00Z"));
    expect(real.map((n) => n.at)).toContain("2026-10-28T18:00:00.000Z");
  });

  it("classifies idea windows", () => {
    const now = new Date("2026-10-14T11:00:00Z"); // 07:00 ET
    const news = [{ title: "CPI", country: "USD", date: "2026-10-14T08:30:00-04:00", impact: "High" }];
    const ctx = buildPulseContext(now, "NQ", news);
    expect(assessIdeaWindow("09:50-10:30", ctx, now).pulse_alignment).toBe("aligned");
    expect(assessIdeaWindow("08:40-09:30", ctx, now).pulse_alignment).toBe("partial");
    expect(assessIdeaWindow("12:00-13:00", ctx, now).pulse_alignment).toBe("off_window");
    expect(assessIdeaWindow("10:50-11:20", ctx, now).pulse_alignment).toBe("partial");
  });
});
