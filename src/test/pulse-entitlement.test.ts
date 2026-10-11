import { describe, expect, it } from "vitest";
import { isPulseActive } from "@/lib/pulse-premium.functions";

const now = new Date("2026-10-07T12:00:00Z");

describe("ICT Pulse entitlement", () => {
  it("active subscription within period unlocks", () => {
    expect(isPulseActive({ subscription_status: "active", current_period_end: "2026-11-01T00:00:00Z" }, now)).toBe(true);
  });
  it("expired period does not unlock", () => {
    expect(isPulseActive({ subscription_status: "active", current_period_end: "2026-10-01T00:00:00Z" }, now)).toBe(false);
  });
  it("canceled or missing does not unlock", () => {
    expect(isPulseActive({ subscription_status: "canceled", current_period_end: null }, now)).toBe(false);
    expect(isPulseActive(null, now)).toBe(false);
  });
});
