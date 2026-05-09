'use client';

import { useFireStore } from '@/lib/store/fireStore';

export type ToolCallArgs = Record<string, unknown>;
export type ToolResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export function executeToolCall(
  name: string,
  args: ToolCallArgs
): ToolResult {
  const store = useFireStore.getState();

  try {
    switch (name) {
      case 'setCurrentAge':
        store.setCurrentAge(Number(args.age));
        return { ok: true, message: `Set current age to ${args.age}` };
      case 'setTargetRetirementAge':
        store.setTargetRetirementAge(Number(args.age));
        return { ok: true, message: `Set retirement age to ${args.age}` };
      case 'setLifeExpectancy':
        store.setLifeExpectancy(Number(args.age));
        return { ok: true, message: `Set life expectancy to ${args.age}` };
      case 'setCurrentCorpus':
        store.setCurrentCorpus(Number(args.amount));
        return { ok: true, message: `Set current corpus to ₹${args.amount}` };
      case 'setMonthlySavings':
        store.setMonthlySavings(Number(args.amount));
        return { ok: true, message: `Set monthly savings to ₹${args.amount}` };
      case 'setAnnualSalaryIncrement':
        store.setAnnualSalaryIncrement(Number(args.percent));
        return { ok: true, message: `Set salary increment to ${args.percent}%` };
      case 'setAnnualSavingsIncrement':
        store.setAnnualSavingsIncrement(Number(args.percent));
        return {
          ok: true,
          message: `Set savings increment to ${args.percent}%`,
        };
      case 'setSafeWithdrawalRate':
        store.setSafeWithdrawalRate(Number(args.percent));
        return { ok: true, message: `Set SWR to ${args.percent}%` };

      case 'addAssetClass':
        store.addAssetClass({
          name: String(args.name),
          allocation: Number(args.allocation),
          expectedReturn: Number(args.expectedReturn),
          icon: args.icon ? String(args.icon) : '💼',
        });
        return { ok: true, message: `Added asset class: ${args.name}` };
      case 'updateAssetAllocation':
        store.updateAssetClassByName(String(args.name), {
          allocation: Number(args.allocation),
        });
        return {
          ok: true,
          message: `Updated ${args.name} allocation to ${args.allocation}%`,
        };
      case 'updateAssetReturn':
        store.updateAssetClassByName(String(args.name), {
          expectedReturn: Number(args.expectedReturn),
        });
        return {
          ok: true,
          message: `Updated ${args.name} expected return to ${args.expectedReturn}%`,
        };
      case 'removeAssetClass':
        store.removeAssetClassByName(String(args.name));
        return { ok: true, message: `Removed ${args.name}` };

      case 'addExpense':
        store.addExpense({
          category: String(args.category),
          monthlyAmount: Number(args.monthlyAmount),
          inflationRate: Number(args.inflationRate),
        });
        return { ok: true, message: `Added expense: ${args.category}` };
      case 'updateExpense': {
        const updates: { monthlyAmount?: number; inflationRate?: number } = {};
        if (args.monthlyAmount !== undefined)
          updates.monthlyAmount = Number(args.monthlyAmount);
        if (args.inflationRate !== undefined)
          updates.inflationRate = Number(args.inflationRate);
        store.updateExpenseByCategory(String(args.category), updates);
        return { ok: true, message: `Updated ${args.category}` };
      }
      case 'removeExpense':
        store.removeExpenseByCategory(String(args.category));
        return { ok: true, message: `Removed ${args.category}` };

      case 'saveScenario': {
        const id = store.saveScenario(String(args.name));
        return {
          ok: true,
          message: `Saved scenario "${args.name}" with id ${id}`,
        };
      }
      case 'loadScenario': {
        const ok = store.loadScenarioByName(String(args.name));
        return ok
          ? { ok: true, message: `Loaded scenario "${args.name}"` }
          : { ok: false, error: `Scenario "${args.name}" not found` };
      }
      case 'compareScenarios': {
        const names = Array.isArray(args.names)
          ? (args.names as unknown[]).map(String)
          : [];
        const matched = names
          .map((n) =>
            store.savedScenarios.find(
              (s) => s.name.toLowerCase() === n.toLowerCase()
            )
          )
          .filter((s): s is NonNullable<typeof s> => Boolean(s));
        store.setComparisonScenarioIds(matched.map((s) => s.id));
        return {
          ok: true,
          message: `Comparing ${matched.length} scenario${matched.length === 1 ? '' : 's'}: ${matched.map((s) => s.name).join(', ')}`,
        };
      }
      case 'resetAll':
        store.resetAll();
        return { ok: true, message: 'Reset all parameters to defaults' };

      default:
        return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
