'use client';

import { useState } from 'react';
import { Menu, MoreHorizontal, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS } from './navConfig';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="-ml-1 grid h-9 w-9 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[280px] flex-col border-white/[0.08] bg-[#0a0a0b] p-0 text-white"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>

        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-emerald-500 text-sm font-bold text-black">
            M
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            UseMoney<span className="text-emerald-400">.</span>
          </span>
        </div>

        {/* New chat */}
        <div className="px-3 pt-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/90 px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <div className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
                {section.label}
              </div>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = !!item.active;
                  return (
                    <li key={item.label}>
                      <a
                        href="#"
                        onClick={() => setOpen(false)}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-2.5 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white',
                          active &&
                            'border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-xs font-semibold text-black">
              AY
            </div>
            <div className="flex-1 truncate text-sm text-white/80">
              Aaryan Yadav
            </div>
            <button
              type="button"
              aria-label="User menu"
              className="grid h-7 w-7 place-items-center rounded-md text-white/40 hover:bg-white/10 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
