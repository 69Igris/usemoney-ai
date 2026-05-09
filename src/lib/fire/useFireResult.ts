'use client';

import { useMemo } from 'react';
import { useFireStore } from '@/lib/store/fireStore';
import { computeFireResult } from './calculations';

export function useFireResult() {
  const parameters = useFireStore((s) => s.parameters);
  const assetAllocation = useFireStore((s) => s.assetAllocation);
  const expenses = useFireStore((s) => s.expenses);
  return useMemo(
    () => computeFireResult(parameters, assetAllocation, expenses),
    [parameters, assetAllocation, expenses]
  );
}
