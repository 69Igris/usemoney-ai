/**
 * Format INR with Indian numbering. Uses lakh / crore for large amounts.
 * Examples: 80900000 → "₹8.09 Cr", 2500000 → "₹25 L", 75000 → "₹75,000".
 */
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  if (abs >= 1e7) return `${sign}₹${trimZeros(abs / 1e7, 2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${trimZeros(abs / 1e5, 2)} L`;
  return `${sign}₹${new Intl.NumberFormat('en-IN').format(Math.round(abs))}`;
}

/** Full-precision Indian-locale INR with two decimals. Example: 70000 → "₹70,000.00". */
export function formatINRFull(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0.00';
  return `₹${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/** Format a percentage. 4 → "4%", 5.5 → "5.5%". When fractionDigits is set, uses exactly that. */
export function formatPercent(value: number, fractionDigits?: number): string {
  if (!Number.isFinite(value)) return '0%';
  if (fractionDigits === undefined) {
    return `${Number(value.toFixed(2))}%`;
  }
  return `${value.toFixed(fractionDigits)}%`;
}

function trimZeros(n: number, digits: number): string {
  return n.toFixed(digits).replace(/\.?0+$/, '');
}

/** Compact INR for chart axis ticks (no decimals). 80000000 → "₹8Cr", 2500000 → "₹25L", 75000 → "₹75K", 0 → "₹0". */
export function formatINRCompact(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs === 0) return '₹0';
  if (abs >= 1e7) return `${sign}₹${Math.round(abs / 1e7)}Cr`;
  if (abs >= 1e5) return `${sign}₹${Math.round(abs / 1e5)}L`;
  if (abs >= 1e3) return `${sign}₹${Math.round(abs / 1e3)}K`;
  return `${sign}₹${Math.round(abs)}`;
}
