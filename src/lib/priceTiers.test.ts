import { describe, expect, it } from "vitest";
import { countConfirmedParticipants, resolvePriceTier } from "@/lib/priceTiers";

const tiers = [
  { minSize: 10, maxSize: 19, price: 15000 },
  { minSize: 20, maxSize: 29, price: 13000 },
];

describe("resolvePriceTier (TC-028, TC-029, TC-030)", () => {
  it("stays in the same tier when the count moves within its band (20 -> 21)", () => {
    expect(resolvePriceTier(20, tiers)?.minSize).toBe(20);
    expect(resolvePriceTier(21, tiers)?.minSize).toBe(20);
  });

  it("re-resolves to the lower tier when the count drops below the boundary", () => {
    expect(resolvePriceTier(19, tiers)?.minSize).toBe(10);
  });

  it("returns null when the count is below the smallest tier (no guessing)", () => {
    expect(resolvePriceTier(5, tiers)).toBeNull();
  });

  it("respects boundary inclusivity (min <= count <= max)", () => {
    expect(resolvePriceTier(10, tiers)?.minSize).toBe(10);
    expect(resolvePriceTier(29, tiers)?.minSize).toBe(20);
    expect(resolvePriceTier(30, tiers)).toBeNull();
  });
});

describe("countConfirmedParticipants", () => {
  it("counts confirmed, non-withdrawn participants", () => {
    const participants = [
      { confirmed: true, withdrawn: false },
      { confirmed: true, withdrawn: false },
      { confirmed: false, withdrawn: false },
    ];
    expect(countConfirmedParticipants(participants)).toBe(2);
  });

  it("excludes withdrawn participants even when confirmed is still true (historical flag)", () => {
    const participants = [
      { confirmed: true, withdrawn: false },
      { confirmed: true, withdrawn: true },
    ];
    expect(countConfirmedParticipants(participants)).toBe(1);
  });
});
