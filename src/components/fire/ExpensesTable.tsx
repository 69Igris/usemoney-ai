'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  totalMonthlyExpenses,
  weightedInflation,
} from '@/lib/fire/calculations';
import { useFireStore } from '@/lib/store/fireStore';
import type { Expense } from '@/lib/fire/types';
import { formatINRFull, formatPercent } from '@/lib/utils/format';

type Editing = { kind: 'add' } | { kind: 'edit'; expense: Expense } | null;

export function ExpensesTable() {
  const expenses = useFireStore((s) => s.expenses);
  const [editing, setEditing] = useState<Editing>(null);

  const total = useMemo(() => totalMonthlyExpenses(expenses), [expenses]);
  const avgInflation = useMemo(() => weightedInflation(expenses), [expenses]);

  const removeExpense = (id: string) =>
    useFireStore.getState().removeExpense(id);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Monthly Expenses
          </h2>
        </div>
        <Button
          size="icon"
          variant="outline"
          aria-label="Add expense"
          onClick={() => setEditing({ kind: 'add' })}
        >
          <Plus />
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wider text-white/40">
              Category
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wider text-white/40">
              Monthly
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wider text-white/40">
              Inflation
            </TableHead>
            <TableHead className="w-24 text-right text-xs uppercase tracking-wider text-white/40">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((e) => (
            <TableRow
              key={e.id}
              className="group border-white/[0.04] hover:bg-white/[0.02]"
            >
              <TableCell className="text-white/90">{e.category}</TableCell>
              <TableCell className="text-right tabular-nums text-white/90">
                {formatINRFull(e.monthlyAmount)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-white/70">
                {formatPercent(e.inflationRate)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Edit ${e.category}`}
                    onClick={() => setEditing({ kind: 'edit', expense: e })}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Delete ${e.category}`}
                    onClick={() => removeExpense(e.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t border-white/[0.08] hover:bg-transparent">
            <TableCell className="font-semibold text-white">Total</TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-white">
              {formatINRFull(total)}
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-white/80">
              {formatPercent(avgInflation)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      <ExpenseDialog editing={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

interface ExpenseDialogProps {
  editing: Editing;
  onClose: () => void;
}

function ExpenseDialog({ editing, onClose }: ExpenseDialogProps) {
  const open = editing !== null;
  const isEdit = editing?.kind === 'edit';
  const seed = editing?.kind === 'edit' ? editing.expense : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit expense' : 'Add expense'}</DialogTitle>
        </DialogHeader>
        {open && (
          <ExpenseForm key={seed?.id ?? 'new'} seed={seed} onDone={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ExpenseFormProps {
  seed: Expense | null;
  onDone: () => void;
}

function ExpenseForm({ seed, onDone }: ExpenseFormProps) {
  const [category, setCategory] = useState(seed?.category ?? '');
  const [monthlyAmount, setMonthlyAmount] = useState(
    String(seed?.monthlyAmount ?? 0)
  );
  const [inflationRate, setInflationRate] = useState(
    String(seed?.inflationRate ?? 0)
  );

  const monthlyNum = Number(monthlyAmount);
  const inflationNum = Number(inflationRate);
  const trimmed = category.trim();
  const canSubmit =
    trimmed.length > 0 &&
    Number.isFinite(monthlyNum) &&
    monthlyNum >= 0 &&
    Number.isFinite(inflationNum) &&
    inflationNum >= 0 &&
    inflationNum <= 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const updates = {
      category: trimmed,
      monthlyAmount: monthlyNum,
      inflationRate: inflationNum,
    };
    if (seed) {
      useFireStore.getState().updateExpense(seed.id, updates);
    } else {
      useFireStore.getState().addExpense(updates);
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <Field label="Category">
        <Input
          autoFocus
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Travel"
        />
      </Field>
      <Field label="Monthly Amount" suffix="₹">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step={500}
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value)}
          className="text-right tabular-nums"
        />
      </Field>
      <Field label="Inflation Rate" suffix="%">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.5}
          value={inflationRate}
          onChange={(e) => setInflationRate(e.target.value)}
          className="text-right tabular-nums"
        />
      </Field>
      <DialogFooter className="mt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="bg-emerald-500 text-black hover:bg-emerald-400"
        >
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

function Field({
  label,
  suffix,
  children,
}: {
  label: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-1.5">
        {children}
        {suffix && <span className="text-xs text-white/40">{suffix}</span>}
      </div>
    </label>
  );
}
