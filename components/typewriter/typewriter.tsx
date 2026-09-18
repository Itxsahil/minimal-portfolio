'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

// Short enough to type out in a few seconds, and true to the "Engineer &
// Writer" bit rather than lorem ipsum.
const LINES = [
  'the cursor blinks. begin.',
  'seven drafts, one keeper.',
  'built slow, on purpose.',
  'still finding my words.',
  'engineer & writer.'
];

const KEYS = 7;

type Pressed = { key: number; beat: number };

export function Typewriter() {
  const [text, setText] = useState('');
  const [returning, setReturning] = useState(false);
  const [pressed, setPressed] = useState<Pressed | null>(null);

  // A single effect owns the whole schedule; line/char position live in
  // closure variables rather than state, since nothing needs to render them
  // on their own. Real time comes from setTimeout, not requestAnimationFrame:
  // this is a few characters a second, not a per-frame animation.
  useEffect(() => {
    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;
    let beat = 0;
    let timer: ReturnType<typeof setTimeout>;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const schedule = (fn: () => void, delay: number) => {
      timer = setTimeout(() => {
        if (cancelled) return;
        if (document.hidden) {
          schedule(fn, 500); // don't burn cycles in a background tab
          return;
        }
        fn();
      }, delay);
    };

    const typeNext = () => {
      const line = LINES[lineIndex % LINES.length];
      if (charIndex < line.length) {
        charIndex++;
        setText(line.slice(0, charIndex));
        beat++;
        setPressed({ key: Math.floor(Math.random() * KEYS), beat });

        // real keystrokes aren't metronomic, and a space is a longer reach
        const justTyped = line[charIndex - 1];
        const base = justTyped === ' ' ? 170 : 55;
        const jitter = justTyped === ' ' ? 130 : 110;
        schedule(typeNext, reduced ? 30 : base + Math.random() * jitter);
      } else {
        schedule(startReturn, reduced ? 250 : 950);
      }
    };

    const startReturn = () => {
      setReturning(true);
      schedule(finishReturn, reduced ? 80 : 320);
    };

    const finishReturn = () => {
      lineIndex++;
      charIndex = 0;
      setReturning(false);
      setText('');
      schedule(typeNext, reduced ? 80 : 260);
    };

    schedule(typeNext, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center">
      <div className="w-full max-w-[15rem]">
        {/* paper */}
        <div className="relative rounded-t-md border border-b-0 border-gray-300 dark:border-zinc-600 bg-[#fbf9f3] dark:bg-zinc-800 shadow-sm px-4 h-14 flex items-center justify-end overflow-hidden">
          <motion.p
            animate={returning ? { x: -10, opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ duration: returning ? 0.28 : 0.16, ease: 'easeIn' }}
            className="font-mono text-[13px] leading-none text-gray-800 dark:text-zinc-200 whitespace-nowrap tracking-tight"
          >
            {text}
            <span className="inline-block w-[1px] h-[1em] -mb-px ml-px bg-gray-700 dark:bg-zinc-300 align-middle animate-pulse" />
          </motion.p>
        </div>

        {/* roller */}
        <div className="h-3 rounded-full bg-gradient-to-b from-gray-300 to-gray-400 dark:from-zinc-600 dark:to-zinc-700 shadow-inner" />

        {/* body */}
        <div className="relative mt-3">
          <div className="h-9 rounded-2xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-xl ring-1 ring-slate-900/5" />
          <div className="absolute inset-x-5 -bottom-1.5 flex justify-between">
            {Array.from({ length: KEYS }).map((_, i) => (
              <motion.span
                key={pressed?.key === i ? `${i}-${pressed.beat}` : i}
                initial={pressed?.key === i ? { y: 0 } : false}
                animate={pressed?.key === i ? { y: [0, 5, 0] } : { y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-zinc-600 ring-1 ring-slate-900/10 shadow-sm"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
