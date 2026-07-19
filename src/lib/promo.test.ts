import { describe, expect, it } from "vitest";
import { generatePromoIdeas } from "@/lib/promo";

describe("generatePromoIdeas (TC-034)", () => {
  it("generates multiple distinct content ideas with image prompts", () => {
    const ideas = generatePromoIdeas("Misión Berkeley");

    expect(ideas.length).toBeGreaterThan(1);
    const angles = new Set(ideas.map((i) => i.angle));
    expect(angles.size).toBe(ideas.length); // every angle is distinct

    for (const idea of ideas) {
      expect(idea.caption.length).toBeGreaterThan(0);
      expect(idea.imagePrompt.length).toBeGreaterThan(0);
    }
  });

  it("interpolates the trip name into every caption and image prompt", () => {
    const ideas = generatePromoIdeas("Misión Berkeley");

    for (const idea of ideas) {
      expect(idea.caption).toContain("Misión Berkeley");
      expect(idea.imagePrompt).toContain("Misión Berkeley");
    }
  });

  it("is deterministic -- the same input produces the same output", () => {
    const first = generatePromoIdeas("Misión Berkeley", new Date("2026-03-01T00:00:00Z"));
    const second = generatePromoIdeas("Misión Berkeley", new Date("2026-03-01T00:00:00Z"));
    expect(first).toEqual(second);
  });

  it("reflects the registration deadline in the urgency angle when provided", () => {
    const withDeadline = generatePromoIdeas("Misión Berkeley", new Date("2026-03-01T00:00:00Z"));
    const withoutDeadline = generatePromoIdeas("Misión Berkeley", null);

    const urgencyWith = withDeadline.find((i) => i.angle === "Countdown / urgency")!;
    const urgencyWithout = withoutDeadline.find((i) => i.angle === "Countdown / urgency")!;

    expect(urgencyWith.caption).toContain("marzo");
    expect(urgencyWithout.caption).not.toContain("undefined");
    expect(urgencyWithout.caption.length).toBeGreaterThan(0);
  });
});
