export interface AssetClass {
  id: string;
  name: string;
  icon: string;
  allocation: number;
  expectedReturn: number;
}

export interface Expense {
  id: string;
  category: string;
  monthlyAmount: number;
  inflationRate: number;
}

export interface FireParameters {
  currentAge: number;
  targetRetirementAge: number;
  lifeExpectancy: number;
  currentCorpus: number;
  monthlySavings: number;
  annualSalaryIncrement: number;
  annualSavingsIncrement: number;
  safeWithdrawalRate: number;
}

export interface Scenario {
  id: string;
  name: string;
  createdAt: number;
  parameters: FireParameters;
  assetAllocation: AssetClass[];
  expenses: Expense[];
}

export interface ProjectionPoint {
  age: number;
  corpus: number;
  fireTarget: number;
}

export type FireStatus = 'on-track' | 'behind' | 'ahead';

export interface FireResult {
  fireNumber: number;
  yearsToFire: number;
  retireAtAge: number;
  totalMonthlyExpenses: number;
  avgInflation: number;
  weightedReturn: number;
  status: FireStatus;
  statusMessage: string;
  projection: ProjectionPoint[];
}
