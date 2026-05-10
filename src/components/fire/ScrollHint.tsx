'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useFireStore } from '@/lib/store/fireStore';

const HIDE_AFTER = 200;
const HAS_MORE_BUFFER = 100;
const RAIL_WIDTH = 380;

export function ScrollHint() {
  const [visible, setVisible] = useState(false);
  const isChatRailOpen = useFireStore((s) => s.isChatRailOpen);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const checkScroll = () => {
      const scrolled = main.scrollTop;
      const hasMore = main.scrollHeight > main.clientHeight + HAS_MORE_BUFFER;
      setVisible(scrolled < HIDE_AFTER && hasMore);
    };

    checkScroll();
    main.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      main.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleClick = () => {
    const main = document.querySelector('main');
    if (!main) return;
    main.scrollBy({
      top: main.clientHeight - HAS_MORE_BUFFER,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          onClick={handleClick}
          aria-label="Scroll for more"
          style={{
            left: isChatRailOpen ? `calc(50% - ${RAIL_WIDTH / 2}px)` : '50%',
          }}
          className="fixed bottom-6 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300 shadow-lg backdrop-blur-md transition-[left,background-color,border-color] duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/20"
        >
          <span>More below</span>
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
