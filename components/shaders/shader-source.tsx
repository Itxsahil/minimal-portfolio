'use client';

import { useState } from 'react';
import { highlight } from 'sugar-high';

export function ShaderSource({ source, title }: { source: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is blocked in some contexts; the source is selectable anyway.
    }
  };

  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm font-mono text-gray-500 dark:text-zinc-400 select-none">
        {title.toLowerCase().replace(/\s+/g, '-')}.frag
      </summary>

      <div className="relative">
        <button
          type="button"
          onClick={copy}
          className="absolute right-3 top-6 rounded-md bg-white/10 px-2 py-1 text-[0.68rem] font-mono text-zinc-300 cursor-pointer"
        >
          {copied ? 'copied' : 'copy'}
        </button>
        <pre>
          <code dangerouslySetInnerHTML={{ __html: highlight(source) }} />
        </pre>
      </div>
    </details>
  );
}
