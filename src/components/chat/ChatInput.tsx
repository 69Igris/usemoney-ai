'use client';

import type { KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFireStore } from '@/lib/store/fireStore';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: (message: string) => void;
}

export function ChatInput({ value, onChange, onSend }: Props) {
  const isLoading = useFireStore((s) => s.isChatLoading);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    onChange('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-white/[0.08] p-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your FIRE plan..."
          rows={1}
          disabled={isLoading}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/30 transition-colors focus:border-emerald-500/50 focus:outline-none disabled:opacity-50"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={submit}
          disabled={isLoading || !value.trim()}
          aria-label="Send"
          className="absolute right-1 top-1 h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}
