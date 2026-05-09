'use client';

import { useEffect, useState } from 'react';
import { Settings, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useFireStore } from '@/lib/store/fireStore';
import type { Expense, FireParameters } from '@/lib/fire/types';
import { formatINRFull } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

type NumberSetterKey =
  | 'setCurrentAge'
  | 'setTargetRetirementAge'
  | 'setLifeExpectancy'
  | 'setCurrentCorpus'
  | 'setMonthlySavings'
  | 'setAnnualSalaryIncrement'
  | 'setAnnualSavingsIncrement'
  | 'setSafeWithdrawalRate';

type ParamUnit = 'years' | '₹' | '%';

interface GroupHeader {
  icon?: 'trending-up';
  label: string;
}

interface ParamConfig {
  key: keyof FireParameters;
  label: string;
  storeAction: NumberSetterKey;
  min: number;
  max: number;
  step: number;
  unit: ParamUnit;
  hasSlider: boolean;
  helpText?: string | ((params: FireParameters, expenses: Expense[]) => string);
  groupHeader?: GroupHeader;
}

const PARAM_CONFIGS: ParamConfig[] = [
  {
    key: 'currentAge',
    label: 'Current Age',
    storeAction: 'setCurrentAge',
    min: 18,
    max: 70,
    step: 1,
    unit: 'years',
    hasSlider: true,
  },
  {
    key: 'targetRetirementAge',
    label: 'Target Retirement Age',
    storeAction: 'setTargetRetirementAge',
    min: 30,
    max: 80,
    step: 1,
    unit: 'years',
    hasSlider: true,
  },
  {
    key: 'lifeExpectancy',
    label: 'Life Expectancy',
    storeAction: 'setLifeExpectancy',
    min: 50,
    max: 100,
    step: 1,
    unit: 'years',
    hasSlider: true,
  },
  {
    key: 'currentCorpus',
    label: 'Current Corpus',
    storeAction: 'setCurrentCorpus',
    min: 0,
    max: 100_000_000,
    step: 10_000,
    unit: '₹',
    hasSlider: false,
  },
  {
    key: 'monthlySavings',
    label: 'Monthly Savings',
    storeAction: 'setMonthlySavings',
    min: 0,
    max: 1_000_000,
    step: 1_000,
    unit: '₹',
    hasSlider: false,
    helpText: () => 'Applied only till retirement age',
  },
  {
    key: 'annualSalaryIncrement',
    label: 'Annual Salary Increment',
    storeAction: 'setAnnualSalaryIncrement',
    min: 0,
    max: 30,
    step: 0.5,
    unit: '%',
    hasSlider: true,
    groupHeader: { icon: 'trending-up', label: 'Income Growth' },
    helpText: () => 'Applied only till retirement age',
  },
  {
    key: 'annualSavingsIncrement',
    label: 'Annual Savings Increment',
    storeAction: 'setAnnualSavingsIncrement',
    min: 0,
    max: 30,
    step: 0.5,
    unit: '%',
    hasSlider: true,
    helpText: (params) => {
      const tenYrSavings =
        params.monthlySavings *
        Math.pow(1 + params.annualSavingsIncrement / 100, 10);
      return `In 10 yrs: ${formatINRFull(tenYrSavings)}/mo (till retirement age)`;
    },
  },
  {
    key: 'safeWithdrawalRate',
    label: 'Safe Withdrawal Rate',
    storeAction: 'setSafeWithdrawalRate',
    min: 1,
    max: 10,
    step: 0.1,
    unit: '%',
    hasSlider: true,
    helpText: (params, expenses) => {
      const annual =
        expenses.reduce((s, e) => s + e.monthlyAmount, 0) * 12;
      const corpusNeeded = annual / (params.safeWithdrawalRate / 100);
      const monthlyWithdrawal =
        (corpusNeeded * (params.safeWithdrawalRate / 100)) / 12;
      const annualWithdrawal =
        (corpusNeeded * params.safeWithdrawalRate) / 100;
      return `Monthly withdrawal: ${formatINRFull(monthlyWithdrawal)}\nAnnual withdrawal: ${formatINRFull(annualWithdrawal)}`;
    },
  },
];

const UNIT_LABEL: Record<ParamUnit, string> = {
  years: 'yr',
  '₹': '₹',
  '%': '%',
};

const SLIDER_ACCENT_CLASSES =
  '[&_[data-slot=slider-track]]:bg-white/10 ' +
  '[&_[data-slot=slider-range]]:bg-emerald-500 ' +
  '[&_[data-slot=slider-thumb]]:bg-emerald-500 ' +
  '[&_[data-slot=slider-thumb]]:border-emerald-500 ' +
  '[&_[data-slot=slider-thumb]]:ring-emerald-500/30';

export function ParametersPanel() {
  const parameters = useFireStore((s) => s.parameters);
  const expenses = useFireStore((s) => s.expenses);

  const handleChange = (action: NumberSetterKey, value: number) => {
    useFireStore.getState()[action](value);
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-6">
      <div className="mb-5 flex items-center gap-2">
        <Settings className="h-5 w-5 text-emerald-400" />
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Parameters
        </h2>
      </div>

      <div className="space-y-5">
        {PARAM_CONFIGS.map((config) => (
          <ParameterRow
            key={config.key}
            config={config}
            value={parameters[config.key]}
            params={parameters}
            expenses={expenses}
            onCommit={(v) => handleChange(config.storeAction, v)}
          />
        ))}
      </div>
    </div>
  );
}

interface ParameterRowProps {
  config: ParamConfig;
  value: number;
  params: FireParameters;
  expenses: Expense[];
  onCommit: (value: number) => void;
}

function ParameterRow({
  config,
  value,
  params,
  expenses,
  onCommit,
}: ParameterRowProps) {
  const [text, setText] = useState(String(value));

  // Sync from store → local text only when the value diverges from what we typed.
  useEffect(() => {
    setText((prev) => {
      const parsed = Number(prev);
      if (!Number.isNaN(parsed) && parsed === value) return prev;
      return String(value);
    });
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setText(v);
    if (v === '' || v === '-') return;
    const parsed = Number(v);
    if (Number.isFinite(parsed)) onCommit(parsed);
  };

  const handleBlur = () => {
    const parsed = Number(text);
    if (!Number.isFinite(parsed)) {
      setText(String(value));
      return;
    }
    const clamped = Math.max(config.min, Math.min(config.max, parsed));
    if (clamped !== parsed) {
      onCommit(clamped);
      setText(String(clamped));
    }
  };

  const helpStr =
    typeof config.helpText === 'function'
      ? config.helpText(params, expenses)
      : config.helpText;

  return (
    <>
      {config.groupHeader && (
        <div className="mt-6 border-t border-white/[0.06] pt-4">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-white/80">
            {config.groupHeader.icon === 'trending-up' && (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            )}
            <span>{config.groupHeader.label}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm text-white/80" htmlFor={`param-${config.key}`}>
            {config.label}
          </label>
          <div className="flex shrink-0 items-center gap-1.5">
            <Input
              id={`param-${config.key}`}
              type="number"
              inputMode="decimal"
              min={config.min}
              max={config.max}
              step={config.step}
              value={text}
              onChange={handleInput}
              onBlur={handleBlur}
              className="h-8 w-24 text-right tabular-nums"
            />
            <span className="w-5 text-xs text-white/40">
              {UNIT_LABEL[config.unit]}
            </span>
          </div>
        </div>

        {config.hasSlider && (
          <Slider
            className={cn(SLIDER_ACCENT_CLASSES)}
            value={[value]}
            min={config.min}
            max={config.max}
            step={config.step}
            onValueChange={(v) => onCommit(v[0])}
          />
        )}

        {helpStr && (
          <p className="whitespace-pre-line text-xs text-white/40">{helpStr}</p>
        )}
      </div>
    </>
  );
}
