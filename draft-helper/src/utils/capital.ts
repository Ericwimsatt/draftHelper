export function draftCapital(pick: number): number {
  return Math.round(5000 * Math.exp(-(pick - 1) / 28));
}
