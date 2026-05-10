import { Bell, Moon, Search } from 'lucide-react';
import { MobileSidebar } from './MobileSidebar';

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0a0a0b] px-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-6">
      {/* Mobile-only: hamburger + compact logo with wordmark */}
      <div className="flex items-center gap-2 lg:hidden">
        <MobileSidebar />
        <div className="flex items-center gap-1.5">
          <div
            className="grid h-7 w-7 place-items-center rounded-md bg-emerald-500 text-sm font-bold text-black"
            aria-label="UseMoney"
          >
            M
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            UseMoney<span className="text-emerald-400">.</span>
          </span>
        </div>
      </div>

      {/* Desktop-only spacer (handed off from Sidebar logo) */}
      <div className="hidden lg:block" />

      {/* Desktop-only: full faux search bar */}
      <div className="hidden w-[480px] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/40 lg:flex">
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search markets, stocks...</span>
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50">
          ⌘K
        </kbd>
      </div>

      {/* Right cluster: search icon (mobile only), theme + notifications */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          aria-label="Search"
          className="grid h-9 w-9 place-items-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Search className="h-4 w-4" />
        </button>
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
          className="hidden h-9 w-9 place-items-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white sm:grid"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
