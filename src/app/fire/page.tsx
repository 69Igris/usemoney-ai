'use client';

import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { ChatRailShell } from '@/components/shell/ChatRailShell';
import { ScenarioBar } from '@/components/fire/ScenarioBar';
import { FireHero } from '@/components/fire/FireHero';
import { WealthProjectionChart } from '@/components/fire/WealthProjectionChart';
import { ParametersPanel } from '@/components/fire/ParametersPanel';
import { AssetAllocationPanel } from '@/components/fire/AssetAllocationPanel';
import { ExpensesTable } from '@/components/fire/ExpensesTable';
import { ScrollHint } from '@/components/fire/ScrollHint';
import { useFireStore } from '@/lib/store/fireStore';
import { cn } from '@/lib/utils';

export default function FirePage() {
  const isChatRailOpen = useFireStore((s) => s.isChatRailOpen);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main
          className={cn(
            'flex-1 overflow-y-auto px-4 pt-4 pb-24 transition-[padding] duration-300 lg:px-8 lg:pt-6 lg:pb-6',
            isChatRailOpen && 'lg:pr-[412px]'
          )}
        >
          <div className="mx-auto max-w-[1400px] space-y-6">
            <ScenarioBar />
            <FireHero />
            <WealthProjectionChart />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ParametersPanel />
              <AssetAllocationPanel />
            </div>
            <ExpensesTable />
          </div>
          <ScrollHint />
        </main>
      </div>
      <ChatRailShell />
    </div>
  );
}
