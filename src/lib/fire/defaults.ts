import type { AssetClass, Expense, FireParameters } from './types';

export const DEFAULT_PARAMETERS: FireParameters = {
  currentAge: 25,
  targetRetirementAge: 50,
  lifeExpectancy: 85,
  currentCorpus: 500000,
  monthlySavings: 75000,
  annualSalaryIncrement: 10,
  annualSavingsIncrement: 12,
  safeWithdrawalRate: 4,
};

export const DEFAULT_ASSET_ALLOCATION: AssetClass[] = [
  { id: 'equity',         name: 'Equity',         icon: '📈', allocation: 60, expectedReturn: 12 },
  { id: 'cash',           name: 'Cash',           icon: '💵', allocation: 5,  expectedReturn: 4  },
  { id: 'gold',           name: 'Gold',           icon: '🪙', allocation: 10, expectedReturn: 8  },
  { id: 'fixed-deposits', name: 'Fixed Deposits', icon: '🏦', allocation: 15, expectedReturn: 7  },
  { id: 'real-estate',    name: 'Real Estate',    icon: '🏡', allocation: 10, expectedReturn: 9  },
];

export const DEFAULT_EXPENSES: Expense[] = [
  { id: 'housing',        category: 'Housing',          monthlyAmount: 25000, inflationRate: 5 },
  { id: 'healthcare',     category: 'Healthcare',       monthlyAmount: 8000,  inflationRate: 8 },
  { id: 'transportation', category: 'Transportation',   monthlyAmount: 6000,  inflationRate: 5 },
  { id: 'food',           category: 'Food & Groceries', monthlyAmount: 15000, inflationRate: 6 },
  { id: 'utilities',      category: 'Utilities',        monthlyAmount: 4000,  inflationRate: 5 },
  { id: 'entertainment',  category: 'Entertainment',    monthlyAmount: 5000,  inflationRate: 4 },
  { id: 'personal-care',  category: 'Personal Care',    monthlyAmount: 3000,  inflationRate: 5 },
  { id: 'miscellaneous',  category: 'Miscellaneous',    monthlyAmount: 4000,  inflationRate: 6 },
];
