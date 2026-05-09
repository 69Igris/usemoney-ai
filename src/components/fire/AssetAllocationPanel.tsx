'use client';

import { useMemo, useState } from 'react';
import { PiggyBank, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFireStore } from '@/lib/store/fireStore';
import { weightedReturn } from '@/lib/fire/calculations';
import type { AssetClass } from '@/lib/fire/types';
import { formatPercent } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

type Editing = { kind: 'add' } | { kind: 'edit'; asset: AssetClass } | null;

export function AssetAllocationPanel() {
  const assetAllocation = useFireStore((s) => s.assetAllocation);
  const [editing, setEditing] = useState<Editing>(null);

  const totalAllocation = useMemo(
    () => assetAllocation.reduce((sum, a) => sum + a.allocation, 0),
    [assetAllocation]
  );
  const expectedReturn = useMemo(
    () => weightedReturn(assetAllocation),
    [assetAllocation]
  );
  const totalIs100 = Math.abs(totalAllocation - 100) < 0.01;

  const removeAssetClass = (id: string) =>
    useFireStore.getState().removeAssetClass(id);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#141416] p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Asset Allocation
          </h2>
        </div>
        <Button
          size="icon"
          variant="outline"
          aria-label="Add asset class"
          onClick={() => setEditing({ kind: 'add' })}
        >
          <Plus />
        </Button>
      </div>

      <div className="mb-5 text-sm">
        <span className={cn(totalIs100 ? 'text-white/60' : 'text-rose-400')}>
          Total: {formatPercent(totalAllocation)}
        </span>
        <span className="mx-2 text-white/30">•</span>
        <span className="text-white/60">
          Expected Return: {formatPercent(expectedReturn)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {assetAllocation.map((asset) => (
          <div
            key={asset.id}
            className="group relative rounded-lg border border-white/[0.05] bg-black/40 p-4 transition-colors hover:border-white/[0.1]"
          >
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={`Edit ${asset.name}`}
                onClick={() => setEditing({ kind: 'edit', asset })}
              >
                <Pencil />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={`Delete ${asset.name}`}
                onClick={() => removeAssetClass(asset.id)}
              >
                <Trash2 />
              </Button>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl leading-none">{asset.icon}</span>
              <span className="font-medium text-white">{asset.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  Allocation
                </span>
                <span className="text-base font-semibold tabular-nums text-white">
                  {formatPercent(asset.allocation)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs uppercase tracking-wider text-white/40">
                  Return
                </span>
                <span className="text-base font-semibold tabular-nums text-emerald-400">
                  {formatPercent(asset.expectedReturn)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AssetDialog editing={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

interface AssetDialogProps {
  editing: Editing;
  onClose: () => void;
}

function AssetDialog({ editing, onClose }: AssetDialogProps) {
  const open = editing !== null;
  const isEdit = editing?.kind === 'edit';
  const seed = editing?.kind === 'edit' ? editing.asset : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit asset class' : 'Add asset class'}</DialogTitle>
        </DialogHeader>
        {open && <AssetForm key={seed?.id ?? 'new'} seed={seed} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

interface AssetFormProps {
  seed: AssetClass | null;
  onDone: () => void;
}

function AssetForm({ seed, onDone }: AssetFormProps) {
  const [name, setName] = useState(seed?.name ?? '');
  const [icon, setIcon] = useState(seed?.icon ?? '💰');
  const [allocation, setAllocation] = useState(String(seed?.allocation ?? 0));
  const [expectedReturn, setExpectedReturn] = useState(
    String(seed?.expectedReturn ?? 0)
  );

  const allocationNum = Number(allocation);
  const returnNum = Number(expectedReturn);
  const allocationValid =
    Number.isFinite(allocationNum) && allocationNum >= 0 && allocationNum <= 100;
  const returnValid =
    Number.isFinite(returnNum) && returnNum >= -50 && returnNum <= 50;
  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && allocationValid && returnValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const updates = {
      name: trimmedName,
      icon: icon.trim() || '💰',
      allocation: allocationNum,
      expectedReturn: returnNum,
    };
    if (seed) {
      useFireStore.getState().updateAssetClass(seed.id, updates);
    } else {
      useFireStore.getState().addAssetClass(updates);
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <Field label="Name">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Equity"
        />
      </Field>
      <Field label="Icon">
        <Input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="📈"
          className="w-20"
        />
      </Field>
      <Field label="Allocation" suffix="%">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={1}
          value={allocation}
          onChange={(e) => setAllocation(e.target.value)}
          className="text-right tabular-nums"
        />
      </Field>
      <Field label="Expected Return" suffix="%">
        <Input
          type="number"
          inputMode="decimal"
          min={-50}
          max={50}
          step={0.5}
          value={expectedReturn}
          onChange={(e) => setExpectedReturn(e.target.value)}
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
        {suffix && (
          <span className="text-xs text-white/40">{suffix}</span>
        )}
      </div>
    </label>
  );
}
