import { describe, expect, it } from "vitest";
import { FREE_DAILY_ANALYSES, isOwnChartUrl } from "@/lib/predict.functions";

const BASE = "https://abc.supabase.co";
const USER = "11111111-1111-1111-1111-111111111111";

describe("analyzeChart guards", () => {
  it("free users get 3 analyses per day", () => {
    expect(FREE_DAILY_ANALYSES).toBe(3);
  });
  it("accepts the user's own signed chart URL", () => {
    expect(isOwnChartUrl(`${BASE}/storage/v1/object/sign/charts/${USER}/a.png?token=x`, BASE, USER)).toBe(true);
  });
  it("rejects other hosts, buckets, and other users", () => {
    expect(isOwnChartUrl(`https://evil.com/storage/v1/object/sign/charts/${USER}/a.png`, BASE, USER)).toBe(false);
    expect(isOwnChartUrl(`${BASE}/storage/v1/object/sign/other/${USER}/a.png`, BASE, USER)).toBe(false);
    expect(isOwnChartUrl(`${BASE}/storage/v1/object/sign/charts/someone-else/a.png`, BASE, USER)).toBe(false);
    expect(isOwnChartUrl(`${BASE}/storage/v1/object/sign/charts/${USER}/../x/a.png`, BASE, USER)).toBe(false);
  });
});
