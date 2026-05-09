'use client';

import { useEffect, useRef } from 'react';
import { Flame } from 'lucide-react';
import { useFireStore } from '@/lib/store/fireStore';
import type { ChatMessage, ToolCallRecord } from '@/lib/store/fireStore';

export function ChatMessages() {
  const messages = useFireStore((s) => s.chatMessages);
  const isLoading = useFireStore((s) => s.isChatLoading);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto px-4 py-4"
    >
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
        <Flame className="h-5 w-5" />
      </div>
      <p className="text-sm text-white/50">
        Ask FIRE anything about your retirement plan.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'system') {
    return (
      <div className="text-center text-xs italic text-white/40">
        {message.content}
      </div>
    );
  }

  if (message.role === 'user') {
    return (
      <div className="ml-8">
        <div className="mb-1 text-xs text-white/40">You</div>
        <div className="whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-[#1a1a1d] p-3 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div className="mr-8">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-emerald-500/15">
          <Flame className="h-3 w-3" />
        </span>
        FIRE
      </div>
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {message.toolCalls.map((tc) => (
            <ToolCallBadge key={tc.id} tc={tc} />
          ))}
        </div>
      )}
      {message.content && (
        <div className="whitespace-pre-wrap text-sm text-white/90">
          {message.content}
        </div>
      )}
    </div>
  );
}

function ToolCallBadge({ tc }: { tc: ToolCallRecord }) {
  const argsStr = Object.values(tc.args)
    .map((v) => {
      if (v === null || v === undefined) return String(v);
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    })
    .join(', ');

  const isError = tc.result === 'error';

  return (
    <span
      className={
        isError
          ? 'inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs text-rose-400'
          : 'inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400'
      }
      title={tc.errorMessage}
    >
      🔧 {tc.name}({argsStr})
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="mr-8 flex items-center gap-1.5 pl-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" />
    </div>
  );
}
