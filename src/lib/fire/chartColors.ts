export const PRIMARY_CORPUS = '#3b82f6';
export const PRIMARY_TARGET = '#f97316';

export const COMPARISON_COLORS = [
  '#a855f7', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#eab308', // yellow
] as const;

export function comparisonColorAt(index: number): string {
  return COMPARISON_COLORS[index % COMPARISON_COLORS.length];
}
