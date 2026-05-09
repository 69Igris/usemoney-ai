import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AssetClass,
  Expense,
  FireParameters,
  Scenario,
} from '../fire/types';
import {
  DEFAULT_PARAMETERS,
  DEFAULT_ASSET_ALLOCATION,
  DEFAULT_EXPENSES,
} from '../fire/defaults';
import { computeFireResult } from '../fire/calculations';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: 'success' | 'error';
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCallRecord[];
  timestamp: number;
}

export interface FireStoreState {
  parameters: FireParameters;
  assetAllocation: AssetClass[];
  expenses: Expense[];

  savedScenarios: Scenario[];
  comparisonScenarioIds: string[];

  chatMessages: ChatMessage[];
  isChatRailOpen: boolean;
  isChatLoading: boolean;
}

export interface FireStoreActions {
  // Parameter setters
  setCurrentAge: (age: number) => void;
  setTargetRetirementAge: (age: number) => void;
  setLifeExpectancy: (age: number) => void;
  setCurrentCorpus: (amount: number) => void;
  setMonthlySavings: (amount: number) => void;
  setAnnualSalaryIncrement: (percent: number) => void;
  setAnnualSavingsIncrement: (percent: number) => void;
  setSafeWithdrawalRate: (percent: number) => void;

  // Asset allocation
  addAssetClass: (asset: Omit<AssetClass, 'id'>) => void;
  updateAssetClass: (
    id: string,
    updates: Partial<Omit<AssetClass, 'id'>>
  ) => void;
  updateAssetClassByName: (
    name: string,
    updates: Partial<Omit<AssetClass, 'id' | 'name'>>
  ) => void;
  removeAssetClass: (id: string) => void;
  removeAssetClassByName: (name: string) => void;

  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => void;
  updateExpenseByCategory: (
    category: string,
    updates: Partial<Omit<Expense, 'id' | 'category'>>
  ) => void;
  removeExpense: (id: string) => void;
  removeExpenseByCategory: (category: string) => void;

  // Scenarios
  saveScenario: (name: string) => string;
  loadScenario: (id: string) => boolean;
  loadScenarioByName: (name: string) => boolean;
  deleteScenario: (id: string) => void;
  setComparisonScenarioIds: (ids: string[]) => void;
  addToComparison: (id: string) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  resetAll: () => void;

  // Chat
  appendChatMessage: (
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ) => string;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChatMessages: () => void;
  setChatLoading: (loading: boolean) => void;
  setChatRailOpen: (open: boolean) => void;
  toggleChatRail: () => void;
}

type Store = FireStoreState & FireStoreActions;

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function isPositiveInt(n: unknown): n is number {
  return isFiniteNumber(n) && Number.isInteger(n) && n > 0;
}

function isNonNegative(n: unknown): n is number {
  return isFiniteNumber(n) && n >= 0;
}

function isPercent(n: unknown): n is number {
  return isFiniteNumber(n) && n >= 0 && n <= 100;
}

function warn(field: string, value: unknown): void {
  console.warn(`[fireStore] Invalid value for ${field}:`, value);
}

// ──────────────────────────────────────────────────────────────────────────
// Initial state
// ──────────────────────────────────────────────────────────────────────────

const initialState: FireStoreState = {
  parameters: DEFAULT_PARAMETERS,
  assetAllocation: DEFAULT_ASSET_ALLOCATION,
  expenses: DEFAULT_EXPENSES,
  savedScenarios: [],
  comparisonScenarioIds: [],
  chatMessages: [],
  isChatRailOpen: true,
  isChatLoading: false,
};

// ──────────────────────────────────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────────────────────────────────

export const useFireStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Parameter setters ────────────────────────────────────────────
      setCurrentAge: (age) => {
        if (!isPositiveInt(age)) return warn('currentAge', age);
        set((s) => ({ parameters: { ...s.parameters, currentAge: age } }));
      },
      setTargetRetirementAge: (age) => {
        if (!isPositiveInt(age)) return warn('targetRetirementAge', age);
        set((s) => ({
          parameters: { ...s.parameters, targetRetirementAge: age },
        }));
      },
      setLifeExpectancy: (age) => {
        if (!isPositiveInt(age)) return warn('lifeExpectancy', age);
        set((s) => ({
          parameters: { ...s.parameters, lifeExpectancy: age },
        }));
      },
      setCurrentCorpus: (amount) => {
        if (!isNonNegative(amount)) return warn('currentCorpus', amount);
        set((s) => ({
          parameters: { ...s.parameters, currentCorpus: amount },
        }));
      },
      setMonthlySavings: (amount) => {
        if (!isNonNegative(amount)) return warn('monthlySavings', amount);
        set((s) => ({
          parameters: { ...s.parameters, monthlySavings: amount },
        }));
      },
      setAnnualSalaryIncrement: (percent) => {
        if (!isPercent(percent)) return warn('annualSalaryIncrement', percent);
        set((s) => ({
          parameters: { ...s.parameters, annualSalaryIncrement: percent },
        }));
      },
      setAnnualSavingsIncrement: (percent) => {
        if (!isPercent(percent)) return warn('annualSavingsIncrement', percent);
        set((s) => ({
          parameters: { ...s.parameters, annualSavingsIncrement: percent },
        }));
      },
      setSafeWithdrawalRate: (percent) => {
        if (!isPercent(percent)) return warn('safeWithdrawalRate', percent);
        set((s) => ({
          parameters: { ...s.parameters, safeWithdrawalRate: percent },
        }));
      },

      // ── Asset allocation ─────────────────────────────────────────────
      addAssetClass: (asset) => {
        const newAsset: AssetClass = { id: generateId(), ...asset };
        set((s) => ({ assetAllocation: [...s.assetAllocation, newAsset] }));
      },
      updateAssetClass: (id, updates) => {
        set((s) => ({
          assetAllocation: s.assetAllocation.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },
      updateAssetClassByName: (name, updates) => {
        const lower = name.toLowerCase();
        set((s) => ({
          assetAllocation: s.assetAllocation.map((a) =>
            a.name.toLowerCase() === lower ? { ...a, ...updates } : a
          ),
        }));
      },
      removeAssetClass: (id) => {
        set((s) => ({
          assetAllocation: s.assetAllocation.filter((a) => a.id !== id),
        }));
      },
      removeAssetClassByName: (name) => {
        const lower = name.toLowerCase();
        set((s) => ({
          assetAllocation: s.assetAllocation.filter(
            (a) => a.name.toLowerCase() !== lower
          ),
        }));
      },

      // ── Expenses ─────────────────────────────────────────────────────
      addExpense: (expense) => {
        const newExpense: Expense = { id: generateId(), ...expense };
        set((s) => ({ expenses: [...s.expenses, newExpense] }));
      },
      updateExpense: (id, updates) => {
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },
      updateExpenseByCategory: (category, updates) => {
        const lower = category.toLowerCase();
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.category.toLowerCase() === lower ? { ...e, ...updates } : e
          ),
        }));
      },
      removeExpense: (id) => {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
      },
      removeExpenseByCategory: (category) => {
        const lower = category.toLowerCase();
        set((s) => ({
          expenses: s.expenses.filter(
            (e) => e.category.toLowerCase() !== lower
          ),
        }));
      },

      // ── Scenarios ────────────────────────────────────────────────────
      saveScenario: (name) => {
        const id = generateId();
        const state = get();
        const scenario: Scenario = {
          id,
          name,
          createdAt: Date.now(),
          parameters: { ...state.parameters },
          assetAllocation: state.assetAllocation.map((a) => ({ ...a })),
          expenses: state.expenses.map((e) => ({ ...e })),
        };
        set((s) => ({ savedScenarios: [...s.savedScenarios, scenario] }));
        return id;
      },
      loadScenario: (id) => {
        const scenario = get().savedScenarios.find((s) => s.id === id);
        if (!scenario) return false;
        set({
          parameters: { ...scenario.parameters },
          assetAllocation: scenario.assetAllocation.map((a) => ({ ...a })),
          expenses: scenario.expenses.map((e) => ({ ...e })),
        });
        return true;
      },
      loadScenarioByName: (name) => {
        const lower = name.toLowerCase();
        const scenario = get().savedScenarios.find(
          (s) => s.name.toLowerCase() === lower
        );
        if (!scenario) return false;
        set({
          parameters: { ...scenario.parameters },
          assetAllocation: scenario.assetAllocation.map((a) => ({ ...a })),
          expenses: scenario.expenses.map((e) => ({ ...e })),
        });
        return true;
      },
      deleteScenario: (id) => {
        set((s) => ({
          savedScenarios: s.savedScenarios.filter((sc) => sc.id !== id),
          comparisonScenarioIds: s.comparisonScenarioIds.filter(
            (cid) => cid !== id
          ),
        }));
      },
      setComparisonScenarioIds: (ids) => {
        set({ comparisonScenarioIds: [...ids] });
      },
      addToComparison: (id) => {
        set((s) =>
          s.comparisonScenarioIds.includes(id)
            ? s
            : { comparisonScenarioIds: [...s.comparisonScenarioIds, id] }
        );
      },
      removeFromComparison: (id) => {
        set((s) => ({
          comparisonScenarioIds: s.comparisonScenarioIds.filter(
            (cid) => cid !== id
          ),
        }));
      },
      clearComparison: () => {
        set({ comparisonScenarioIds: [] });
      },
      resetAll: () => {
        // Resets parameters, asset allocation, and expenses to factory defaults.
        // Saved scenarios are intentionally PRESERVED — only the active inputs reset.
        set({
          parameters: DEFAULT_PARAMETERS,
          assetAllocation: DEFAULT_ASSET_ALLOCATION,
          expenses: DEFAULT_EXPENSES,
        });
      },

      // ── Chat ─────────────────────────────────────────────────────────
      appendChatMessage: (message) => {
        const id = generateId();
        const newMessage: ChatMessage = {
          id,
          timestamp: Date.now(),
          ...message,
        };
        set((s) => ({ chatMessages: [...s.chatMessages, newMessage] }));
        return id;
      },
      updateChatMessage: (id, updates) => {
        set((s) => ({
          chatMessages: s.chatMessages.map((m) =>
            m.id === id ? { ...m, ...updates, id: m.id } : m
          ),
        }));
      },
      clearChatMessages: () => {
        set({ chatMessages: [] });
      },
      setChatLoading: (loading) => {
        set({ isChatLoading: loading });
      },
      setChatRailOpen: (open) => {
        set({ isChatRailOpen: open });
      },
      toggleChatRail: () => {
        set((s) => ({ isChatRailOpen: !s.isChatRailOpen }));
      },
    }),
    {
      name: 'usemoney-fire-v1',
      partialize: (state) => ({
        parameters: state.parameters,
        assetAllocation: state.assetAllocation,
        expenses: state.expenses,
        savedScenarios: state.savedScenarios,
      }),
    }
  )
);

// ──────────────────────────────────────────────────────────────────────────
// Selectors
// ──────────────────────────────────────────────────────────────────────────

export const selectFireResult = (state: FireStoreState) =>
  computeFireResult(state.parameters, state.assetAllocation, state.expenses);

export const selectScenarioById = (state: FireStoreState, id: string) =>
  state.savedScenarios.find((s) => s.id === id);

export const selectComparisonScenarios = (state: FireStoreState) =>
  state.comparisonScenarioIds
    .map((id) => state.savedScenarios.find((s) => s.id === id))
    .filter((s): s is Scenario => s !== undefined);
