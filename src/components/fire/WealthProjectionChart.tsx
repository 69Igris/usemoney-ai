'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useFireStore } from '@/lib/store/fireStore';
import { useFireResult } from '@/lib/fire/useFireResult';
import { simulateProjection } from '@/lib/fire/calculations';
import type { Scenario } from '@/lib/fire/types';
import { formatINR, formatINRCompact } from '@/lib/utils/format';
import {
  COMPARISON_COLORS,
  PRIMARY_CORPUS,
  PRIMARY_TARGET,
} from '@/lib/fire/chartColors';

interface ChartPoint {
  age: number;
  corpus: number;
  fireTarget: number;
  [key: string]: number;
}

export function WealthProjectionChart() {
  const result = useFireResult();
  const parameters = useFireStore((s) => s.parameters);
  const savedScenarios = useFireStore((s) => s.savedScenarios);
  const comparisonScenarioIds = useFireStore((s) => s.comparisonScenarioIds);

  const comparisons: Scenario[] = useMemo(
    () =>
      comparisonScenarioIds
        .map((id) => savedScenarios.find((s) => s.id === id))
        .filter((s): s is Scenario => s !== undefined),
    [comparisonScenarioIds, savedScenarios]
  );

  const data: ChartPoint[] = useMemo(() => {
    const compProjections = comparisons.map((s) => ({
      id: s.id,
      points: simulateProjection(s.parameters, s.assetAllocation, s.expenses),
    }));

    return result.projection.map((p, i) => {
      const point: ChartPoint = {
        age: p.age,
        corpus: p.corpus,
        fireTarget: p.fireTarget,
      };
      for (const cp of compProjections) {
        const cpPoint = cp.points[i];
        if (cpPoint) point[cp.id] = cpPoint.corpus;
      }
      return point;
    });
  }, [result.projection, comparisons]);

  const ageTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let a = parameters.currentAge; a <= parameters.lifeExpectancy; a++) {
      if (
        a === parameters.currentAge ||
        a === parameters.lifeExpectancy ||
        a % 5 === 0
      ) {
        ticks.push(a);
      }
    }
    return ticks;
  }, [parameters.currentAge, parameters.lifeExpectancy]);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Wealth Projection
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Your path to financial independence
          </p>
        </div>
        <ChartLegend comparisons={comparisons} />
      </div>

      <div className="mt-6 h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 16, bottom: 28, left: 0 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="age"
              type="number"
              ticks={ageTicks}
              domain={[parameters.currentAge, parameters.lifeExpectancy]}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.4)' }}
              label={{
                value: 'Age',
                position: 'insideBottom',
                fill: 'rgba(255,255,255,0.4)',
                fontSize: 11,
                dy: 16,
              }}
            />
            <YAxis
              tickFormatter={(v: number) => formatINRCompact(Number(v))}
              stroke="rgba(255,255,255,0.1)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.4)' }}
              width={70}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
              content={(props) => (
                <ChartTooltip {...props} comparisons={comparisons} />
              )}
            />
            <ReferenceLine
              x={parameters.targetRetirementAge}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="3 3"
              label={{
                value: 'Retirement',
                position: 'insideTopLeft',
                fill: 'rgba(255,255,255,0.6)',
                fontSize: 11,
                angle: -90,
                offset: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey="fireTarget"
              name="FIRE Target"
              stroke={PRIMARY_TARGET}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="corpus"
              name="Your Corpus"
              stroke={PRIMARY_CORPUS}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {comparisons.map((s, i) => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                name={s.name}
                stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]}
                strokeWidth={2}
                strokeDasharray="3 3"
                strokeOpacity={0.6}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartLegend({ comparisons }: { comparisons: Scenario[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/70">
      <LegendDot color={PRIMARY_CORPUS} label="Your Corpus" />
      <LegendDot color={PRIMARY_TARGET} label="FIRE Target" dashed />
      {comparisons.map((s, i) => (
        <LegendDot
          key={s.id}
          color={COMPARISON_COLORS[i % COMPARISON_COLORS.length]}
          label={s.name}
          dashed
        />
      ))}
    </div>
  );
}

function LegendDot({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block w-4"
        style={{
          borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
          opacity: dashed ? 0.8 : 1,
        }}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </div>
  );
}

interface TooltipPayload {
  dataKey?: unknown;
  value?: unknown;
  name?: unknown;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: number | string;
  payload?: readonly TooltipPayload[];
  comparisons: Scenario[];
}

function ChartTooltip({
  active,
  label,
  payload,
  comparisons,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const get = (key: string) =>
    payload.find((p) => String(p.dataKey) === key);
  const fire = get('fireTarget');
  const corpus = get('corpus');

  return (
    <div className="rounded-md border border-white/10 bg-[#1a1a1d] p-3 text-xs shadow-lg">
      <div className="mb-1.5 font-medium text-white">Age: {label}</div>
      {fire && typeof fire.value === 'number' && (
        <div className="text-orange-400">
          FIRE Target: {formatINR(fire.value)}
        </div>
      )}
      {corpus && typeof corpus.value === 'number' && (
        <div className="text-blue-400">
          Your Corpus: {formatINR(corpus.value)}
        </div>
      )}
      {comparisons.map((s) => {
        const p = get(s.id);
        if (!p || typeof p.value !== 'number') return null;
        return (
          <div key={s.id} className="mt-0.5 text-white/70">
            {s.name}: {formatINR(p.value)}
          </div>
        );
      })}
    </div>
  );
}
