// Pure price-tier resolution (FEAT-007, FR-013). No Prisma/Next imports here
// so this stays trivially unit-testable, same convention as funnel.ts.

// FR-013: the confirmed count is cumulative — participants who reached
// Confirmed and later advanced (e.g. to F2 complete) still count.
// Participant.confirmed already behaves this way (markF2Complete never
// clears it); withdrawn participants are excluded even if `confirmed` is
// still true (a historical flag, per FEAT-004).
export function countConfirmedParticipants(
  participants: { confirmed: boolean; withdrawn: boolean }[],
): number {
  return participants.filter((p) => p.confirmed && !p.withdrawn).length;
}

// Boundary inclusivity: min <= count <= max. Returns null when no tier
// covers the count ("no tier / below minimum" — TC-030) rather than
// guessing. No accompanying-professor exclusion yet — that requires
// is_accompanying_professor (FR-022, not built); documented v1 gap.
export function resolvePriceTier<T extends { minSize: number; maxSize: number }>(
  confirmedCount: number,
  tiers: T[],
): T | null {
  return tiers.find((t) => confirmedCount >= t.minSize && confirmedCount <= t.maxSize) ?? null;
}
