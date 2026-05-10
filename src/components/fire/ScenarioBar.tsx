'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Check,
  Flame,
  FolderOpen,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useFireStore } from '@/lib/store/fireStore';
import { comparisonColorAt } from '@/lib/fire/chartColors';
import { cn } from '@/lib/utils';

export function ScenarioBar() {
  const savedScenarios = useFireStore((s) => s.savedScenarios);
  const comparisonScenarioIds = useFireStore((s) => s.comparisonScenarioIds);
  const resetAll = useFireStore((s) => s.resetAll);
  const saveScenario = useFireStore((s) => s.saveScenario);
  const loadScenario = useFireStore((s) => s.loadScenario);
  const clearComparison = useFireStore((s) => s.clearComparison);

  const [resetOpen, setResetOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  const handleSave = () => {
    const name = scenarioName.trim();
    if (!name) return;
    saveScenario(name);
    setScenarioName('');
    setSaveOpen(false);
  };

  const comparingCount = comparisonScenarioIds.length;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-white">
            <Flame className="h-7 w-7 text-emerald-400" />
            FIRE Calculator
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            Plan your Financial Independence, Retire Early journey
          </p>
          {comparingCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
              <span>
                Comparing {comparingCount} scenario
                {comparingCount === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={clearComparison}
                aria-label="Clear comparison"
                className="rounded-full p-0.5 transition-colors hover:bg-emerald-500/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen />
                <span className="hidden sm:inline">Load</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {savedScenarios.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-white/50">
                  No saved scenarios yet.
                </div>
              ) : (
                savedScenarios.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onSelect={() => loadScenario(s.id)}
                  >
                    {s.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            disabled={savedScenarios.length < 1}
            onClick={() => setCompareOpen(true)}
          >
            <BarChart3 />
            <span className="hidden sm:inline">Compare</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setSaveOpen(true)}
            className="bg-emerald-500 text-black hover:bg-emerald-400"
          >
            <Save />
            <span className="hidden sm:inline">Save Scenario</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Reset confirm dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset to defaults?</DialogTitle>
            <DialogDescription>
              This restores parameters, asset allocation, and expenses to their
              defaults. Saved scenarios are preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                resetAll();
                setResetOpen(false);
              }}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save scenario dialog */}
      <Dialog
        open={saveOpen}
        onOpenChange={(open) => {
          setSaveOpen(open);
          if (!open) setScenarioName('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save scenario</DialogTitle>
            <DialogDescription>
              Give this set of inputs a name so you can load it later.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="grid gap-3"
          >
            <Input
              autoFocus
              placeholder="e.g. Conservative plan"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setSaveOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!scenarioName.trim()}
                className="bg-emerald-500 text-black hover:bg-emerald-400"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Compare scenarios dialog */}
      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} />
    </>
  );
}

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CompareDialog({ open, onOpenChange }: CompareDialogProps) {
  const savedScenarios = useFireStore((s) => s.savedScenarios);
  const comparisonScenarioIds = useFireStore((s) => s.comparisonScenarioIds);
  const setComparisonScenarioIds = useFireStore(
    (s) => s.setComparisonScenarioIds
  );

  const [selected, setSelected] = useState<string[]>(comparisonScenarioIds);

  // Re-sync local state from store each time the dialog opens.
  useEffect(() => {
    if (open) setSelected(comparisonScenarioIds);
  }, [open, comparisonScenarioIds]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const apply = () => {
    setComparisonScenarioIds(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compare Scenarios</DialogTitle>
          <DialogDescription>
            Overlay multiple saved scenarios on the chart.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          {savedScenarios.length === 0 ? (
            <div className="rounded-md border border-white/[0.06] bg-white/5 px-3 py-4 text-center text-sm text-white/50">
              No saved scenarios yet.
            </div>
          ) : (
            savedScenarios.map((s) => {
              const idx = selected.indexOf(s.id);
              const isSelected = idx !== -1;
              const color = isSelected ? comparisonColorAt(idx) : null;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                    isSelected
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-white/[0.06] bg-white/5 hover:border-white/10 hover:bg-white/10'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full border"
                      style={{
                        backgroundColor: color ?? 'transparent',
                        borderColor: color ?? 'rgba(255,255,255,0.15)',
                      }}
                      aria-hidden
                    />
                    <span className="text-sm text-white/90">{s.name}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="text-xs text-white/50">
          Currently comparing: {selected.length} scenario
          {selected.length === 1 ? '' : 's'}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            disabled={selected.length === 0}
            onClick={() => setSelected([])}
          >
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={apply}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
