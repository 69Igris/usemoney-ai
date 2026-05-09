'use client';

import { useMemo, type ReactNode } from 'react';
import { useFireStore } from '@/lib/store/fireStore';
import { computeFireResult } from '@/lib/fire/calculations';
import type { FireStatus } from '@/lib/fire/types';
import { formatINR, formatINRFull, formatPercent } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  valueClassName?: string;
  subtext?: string;
  gradientClassName: string;
  prefix?: ReactNode;
}

function KpiCard({
  label,
  value,
  valueClassName,
  subtext,
  gradientClassName,
  prefix,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'relative min-h-[120px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#141416] p-5 transition-colors hover:border-white/[0.12]',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-gradient-to-b before:to-transparent',
        gradientClassName
      )}
    >
      <div className="relative text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </div>
      <div
        className={cn(
          'relative mt-3 flex items-center gap-2 text-2xl font-bold tracking-tight',
          valueClassName
        )}
      >
        {prefix}
        <span className="truncate">{value}</span>
      </div>
      {subtext && (
        <div className="relative mt-2 text-xs text-white/40">{subtext}</div>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<FireStatus, string> = {
  'on-track': 'On Track',
  ahead: 'Ahead',
  behind: 'Behind',
};

export function FireHero() {
  const parameters = useFireStore((s) => s.parameters);
  const assetAllocation = useFireStore((s) => s.assetAllocation);
  const expenses = useFireStore((s) => s.expenses);

  const result = useMemo(
    () => computeFireResult(parameters, assetAllocation, expenses),
    [parameters, assetAllocation, expenses]
  );

  const isBehind = result.status === 'behind';
  const statusColor = isBehind ? 'text-amber-400' : 'text-emerald-400';
  const statusDot = isBehind ? 'bg-amber-400' : 'bg-emerald-400';
  const statusGradient = isBehind
    ? 'before:from-amber-500/10'
    : 'before:from-emerald-500/10';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard
        label="FIRE Number"
        value={formatINR(result.fireNumber)}
        valueClassName="text-orange-400"
        subtext="Target corpus needed"
        gradientClassName="before:from-orange-500/10"
      />
      <KpiCard
        label="Years to FIRE"
        value={`${result.yearsToFire} years`}
        valueClassName="text-emerald-400"
        subtext={`Retire at age ${result.retireAtAge}`}
        gradientClassName="before:from-emerald-500/10"
      />
      <KpiCard
        label="Monthly Expenses"
        value={formatINRFull(result.totalMonthlyExpenses)}
        valueClassName="text-cyan-400"
        subtext={`${formatPercent(result.avgInflation)} avg inflation`}
        gradientClassName="before:from-cyan-500/10"
      />
      <KpiCard
        label="Monthly Savings"
        value={formatINRFull(parameters.monthlySavings)}
        valueClassName="text-purple-400"
        subtext={`+${formatPercent(parameters.annualSavingsIncrement)}/yr`}
        gradientClassName="before:from-purple-500/10"
      />
      <KpiCard
        label="Status"
        value={STATUS_LABEL[result.status]}
        valueClassName={statusColor}
        subtext={result.statusMessage}
        gradientClassName={statusGradient}
        prefix={
          <span
            className={cn('inline-block h-2.5 w-2.5 rounded-full', statusDot)}
            aria-hidden
          />
        }
      />
    </div>
  );
}
