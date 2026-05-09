import type {
  AssetClass,
  Expense,
  FireParameters,
  FireResult,
  ProjectionPoint,
  FireStatus,
} from './types';

/** Allocation-weighted average expected return across all asset classes. */
export function weightedReturn(assets: AssetClass[]): number {
  const totalAllocation = assets.reduce((sum, a) => sum + a.allocation, 0);
  if (totalAllocation === 0) return 0;
  const weighted = assets.reduce(
    (sum, a) => sum + a.allocation * a.expectedReturn,
    0
  );
  return weighted / totalAllocation;
}

/** Expense-weighted average inflation rate across all expense categories. */
export function weightedInflation(expenses: Expense[]): number {
  const totalMonthly = expenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
  if (totalMonthly === 0) return 0;
  const weighted = expenses.reduce(
    (sum, e) => sum + e.monthlyAmount * e.inflationRate,
    0
  );
  return weighted / totalMonthly;
}

/** Sum of all monthly expense amounts. */
export function totalMonthlyExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
}

/** Project each expense forward at its own inflation rate; return total annual. */
export function inflatedAnnualExpenses(
  expenses: Expense[],
  yearsFromNow: number
): number {
  return expenses.reduce((sum, e) => {
    const factor = Math.pow(1 + e.inflationRate / 100, yearsFromNow);
    return sum + e.monthlyAmount * 12 * factor;
  }, 0);
}

/** FIRE corpus needed at a given annual expense level and SWR. */
export function fireNumberAt(
  annualExpensesAtRetirement: number,
  swrPercent: number
): number {
  if (swrPercent <= 0) return Infinity;
  return annualExpensesAtRetirement / (swrPercent / 100);
}

/** Year-by-year corpus simulation from currentAge through lifeExpectancy. */
export function simulateProjection(
  params: FireParameters,
  assets: AssetClass[],
  expenses: Expense[]
): ProjectionPoint[] {
  const r = weightedReturn(assets);
  const growthFactor = 1 + r / 100;
  const savingsGrowth = 1 + params.annualSavingsIncrement / 100;
  const swr = params.safeWithdrawalRate;

  const points: ProjectionPoint[] = [];
  let corpus = params.currentCorpus;

  for (let age = params.currentAge; age <= params.lifeExpectancy; age++) {
    const yearsFromNow = age - params.currentAge;
    const annualExpensesAtAge = inflatedAnnualExpenses(expenses, yearsFromNow);
    const fireTarget = fireNumberAt(annualExpensesAtAge, swr);

    points.push({ age, corpus, fireTarget });

    if (age === params.lifeExpectancy) break;

    if (age < params.targetRetirementAge) {
      const annualSavings =
        params.monthlySavings * 12 * Math.pow(savingsGrowth, yearsFromNow);
      corpus = corpus * growthFactor + annualSavings;
    } else {
      const withdrawal = annualExpensesAtAge;
      corpus = corpus * growthFactor - withdrawal;
    }
  }

  return points;
}

/** Find the first age where corpus reaches fireTarget and classify the result. */
export function determineStatus(
  projection: ProjectionPoint[],
  targetRetirementAge: number
): { status: FireStatus; retireAtAge: number; statusMessage: string } {
  const lifeExpectancy =
    projection.length > 0
      ? projection[projection.length - 1].age
      : targetRetirementAge;

  let retireAtAge = lifeExpectancy;
  let reached = false;

  for (const p of projection) {
    if (p.corpus >= p.fireTarget) {
      retireAtAge = p.age;
      reached = true;
      break;
    }
  }

  let status: FireStatus;
  let statusMessage: string;

  if (!reached) {
    status = 'behind';
    statusMessage = `You may not reach FIRE by age ${targetRetirementAge}.`;
  } else if (retireAtAge < targetRetirementAge - 2) {
    status = 'ahead';
    statusMessage = `You can retire by age ${retireAtAge}!`;
  } else if (Math.abs(retireAtAge - targetRetirementAge) <= 2) {
    status = 'on-track';
    statusMessage = `You're on track to retire at age ${retireAtAge}.`;
  } else {
    status = 'behind';
    statusMessage = `You may not reach FIRE until age ${retireAtAge}.`;
  }

  return { status, retireAtAge, statusMessage };
}

/** Top-level: combines projection, status, and summary metrics into a FireResult. */
export function computeFireResult(
  params: FireParameters,
  assets: AssetClass[],
  expenses: Expense[]
): FireResult {
  const projection = simulateProjection(params, assets, expenses);
  const { status, retireAtAge, statusMessage } = determineStatus(
    projection,
    params.targetRetirementAge
  );

  const targetPoint = projection.find(
    (p) => p.age === params.targetRetirementAge
  );
  const fireNumber = targetPoint
    ? targetPoint.fireTarget
    : fireNumberAt(
        inflatedAnnualExpenses(
          expenses,
          params.targetRetirementAge - params.currentAge
        ),
        params.safeWithdrawalRate
      );

  return {
    fireNumber,
    yearsToFire: retireAtAge - params.currentAge,
    retireAtAge,
    totalMonthlyExpenses: totalMonthlyExpenses(expenses),
    avgInflation: weightedInflation(expenses),
    weightedReturn: weightedReturn(assets),
    status,
    statusMessage,
    projection,
  };
}
