'use client';

const QUICK_PROMPTS = [
  'Can I retire at 45?',
  'What if I save ₹20k more?',
  'Make my plan more conservative',
  'How am I doing right now?',
];

interface Props {
  onSelect: (prompt: string) => void;
}

export function QuickActions({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
