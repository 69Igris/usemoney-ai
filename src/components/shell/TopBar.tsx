import { Bell, Moon, Search } from 'lucide-react';

export function TopBar() {
  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 bg-[#0a0a0b] px-6">
      <div />

      {/* Faux search bar */}
      <div className="flex w-[480px] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/40">
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search markets, stocks...</span>
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50">
          ⌘K
        </kbd>
      </div>

      {/* Right cluster */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          aria-label="Toggle theme"
          className="grid h-9 w-9 place-items-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
