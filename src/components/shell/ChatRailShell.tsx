'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Flame, MessageSquare } from 'lucide-react';
import { useFireStore } from '@/lib/store/fireStore';
import type { ToolCallRecord } from '@/lib/store/fireStore';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { QuickActions } from '@/components/chat/QuickActions';
import { ChatInput } from '@/components/chat/ChatInput';
import { executeToolCall } from '@/lib/ai/toolExecutor';

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface ToolResultMessage {
  tool_call_id: string;
  role: 'tool';
  name: string;
  content: string;
}

function snapshotState() {
  const s = useFireStore.getState();
  return {
    parameters: s.parameters,
    assetAllocation: s.assetAllocation,
    expenses: s.expenses,
    savedScenarios: s.savedScenarios.map(({ id, name }) => ({ id, name })),
  };
}

export function ChatRailShell() {
  const isOpen = useFireStore((s) => s.isChatRailOpen);
  const toggle = useFireStore((s) => s.toggleChatRail);
  const messages = useFireStore((s) => s.chatMessages);

  const [inputValue, setInputValue] = useState('');

  const handleSend = async (message: string) => {
    const { appendChatMessage, setChatLoading } = useFireStore.getState();

    appendChatMessage({ role: 'user', content: message });
    setChatLoading(true);

    try {
      const history = useFireStore
        .getState()
        .chatMessages.filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          currentState: snapshotState(),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `API error: ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg = data.message ?? {};
      const toolCalls: ToolCall[] = assistantMsg.tool_calls ?? [];

      if (toolCalls.length === 0) {
        appendChatMessage({
          role: 'assistant',
          content: assistantMsg.content ?? '(empty response)',
        });
        return;
      }

      const records: ToolCallRecord[] = [];
      const toolResults: ToolResultMessage[] = [];

      for (const tc of toolCalls) {
        const name = tc.function.name;
        let args: Record<string, unknown> = {};
        try {
          args = tc.function.arguments
            ? JSON.parse(tc.function.arguments)
            : {};
        } catch (e) {
          console.error('Failed to parse tool arguments:', e);
        }

        const result = executeToolCall(name, args);
        records.push({
          id: tc.id,
          name,
          args,
          result: result.ok ? 'success' : 'error',
          errorMessage: result.ok ? undefined : result.error,
        });
        toolResults.push({
          tool_call_id: tc.id,
          role: 'tool',
          name,
          content: result.ok ? result.message : `Error: ${result.error}`,
        });
      }

      appendChatMessage({
        role: 'assistant',
        content: assistantMsg.content ?? '',
        toolCalls: records,
      });

      const followUp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...history,
            {
              role: 'assistant',
              content: assistantMsg.content ?? '',
              tool_calls: toolCalls,
            },
            ...toolResults,
          ],
          currentState: snapshotState(),
        }),
      });

      if (followUp.ok) {
        const followData = await followUp.json();
        if (followData.message?.content) {
          appendChatMessage({
            role: 'assistant',
            content: followData.message.content,
          });
        }
      }
    } catch (err) {
      appendChatMessage({
        role: 'assistant',
        content: `Sorry, I hit an error: ${err instanceof Error ? err.message : 'unknown'}. Try again?`,
      });
      console.error('handleSend error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {!isOpen && (
          <motion.button
            type="button"
            key="chat-tab"
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 32, opacity: 0 }}
            transition={SPRING}
            onClick={toggle}
            aria-label="Open chat"
            className="fixed right-0 top-1/2 z-30 flex h-20 w-8 -translate-y-1/2 items-center justify-center rounded-l-md border-y border-l border-white/10 bg-[#141416] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <MessageSquare className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            key="chat-rail"
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={SPRING}
            className="fixed right-0 top-0 z-30 flex h-screen w-[380px] flex-col border-l border-white/[0.08] bg-[#0a0a0b]"
          >
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
                  <Flame className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-white/90">
                  Ask FIRE
                </span>
              </div>
              <button
                type="button"
                onClick={toggle}
                aria-label="Collapse chat"
                className="grid h-7 w-7 place-items-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1">
              <ChatMessages />
            </div>

            {messages.length === 0 && (
              <div className="px-4 pb-2">
                <QuickActions onSelect={(prompt) => setInputValue(prompt)} />
              </div>
            )}

            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
