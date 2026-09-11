"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  READING_SIZE,
  REFRESH_MS,
  STORAGE_KEY,
  THEMES,
  type ThemeId,
} from "./themes";
import "./theme.css";

type Settings = {
  theme: ThemeId | null;
  size: number;
  dropCap: boolean;
  frontlight: boolean;
};

const DEFAULTS: Settings = {
  theme: null,
  size: READING_SIZE.default,
  dropCap: false,
  frontlight: true,
};

function readStored(): Settings {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    const known = THEMES.some((t) => t.id === parsed.theme);
    return {
      theme: known ? (parsed.theme as ThemeId) : null,
      size:
        typeof parsed.size === "number"
          ? Math.min(READING_SIZE.max, Math.max(READING_SIZE.min, parsed.size))
          : DEFAULTS.size,
      dropCap: parsed.dropCap === true,
      frontlight: parsed.frontlight !== false,
    };
  } catch {
    return DEFAULTS;
  }
}

/** A reading face downloads the first time its theme is chosen. Switching
 *  before it arrives reflows the page in full view, so the swap waits for the
 *  font and lands behind the refresh. The cap keeps a slow network from
 *  stalling the switch. */
function waitForFont(family: string | undefined, capMs: number): Promise<void> {
  const cap = new Promise<void>((resolve) => setTimeout(resolve, capMs));
  if (!family || typeof document === "undefined" || !("fonts" in document)) {
    return cap;
  }
  const loaded = document.fonts
    .load(`1rem "${family}"`)
    .then(() => undefined)
    .catch(() => undefined);
  return Promise.race([loaded, cap]);
}

export function ThemePicker() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // The inline script in the layout has already painted the saved choice, so
  // this only syncs React's copy of it.
  useEffect(() => {
    setSettings(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Private windows and blocked site data just lose the preference.
    }
  }, [settings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;

    if (settings.theme) {
      root.setAttribute("data-theme", settings.theme);
      root.setAttribute("data-dropcap", settings.dropCap ? "on" : "off");
      root.setAttribute("data-frontlight", settings.frontlight ? "on" : "off");
      root.style.setProperty("--reading-size", `${settings.size}px`);
    } else {
      root.removeAttribute("data-theme");
      root.removeAttribute("data-dropcap");
      root.removeAttribute("data-frontlight");
      root.style.removeProperty("--reading-size");
    }
  }, [settings, hydrated]);

  // The article opens with a title and a mono date line, so the drop cap goes
  // on the first paragraph carrying real prose.
  useEffect(() => {
    const surface = document.querySelector(".reading-surface");
    if (!surface) return;

    for (const p of Array.from(surface.querySelectorAll("p[data-dropcap]"))) {
      p.removeAttribute("data-dropcap");
    }
    if (!(settings.theme && settings.dropCap)) return;

    const target = Array.from(surface.querySelectorAll("p")).find(
      (p) => (p.textContent ?? "").trim().length > 80,
    );
    target?.setAttribute("data-dropcap", "");
  }, [settings.theme, settings.dropCap, pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), []);

  const chooseTheme = useCallback(
    async (id: ThemeId | null) => {
      refresh();
      await waitForFont(THEMES.find((t) => t.id === id)?.family, 260);
      setSettings((prev) => ({ ...prev, theme: id }));
    },
    [refresh],
  );

  const active = THEMES.find((t) => t.id === settings.theme);

  return (
    <>
      {settings.theme && (
        <>
          <div className="theme-layer theme-layer--texture" aria-hidden />
          <div className="theme-layer theme-layer--tint" aria-hidden />
        </>
      )}

      {refreshKey > 0 && (
        <div
          key={refreshKey}
          className="theme-refresh"
          aria-hidden
          style={{ ["--refresh-ms" as string]: `${REFRESH_MS}ms` }}
          onAnimationEnd={(e) => {
            if (e.animationName.includes("waveform")) setRefreshKey(0);
          }}
        />
      )}

      <div
        className="theme-dock fixed bottom-5 left-5 z-[60]"
      >
        {open && (
          <div
            ref={panelRef}
            role="group"
            aria-label="Reading theme"
            className="mb-2 w-[min(19rem,calc(100vw-2.5rem))] max-h-[min(78vh,40rem)] overflow-y-auto rounded-xl border border-rule bg-paper p-4 text-ink shadow-2xl font-mono"
          >
            <p className="mb-2 text-[0.66rem] uppercase tracking-[0.16em] text-muted">
              Reading theme
            </p>

            <div className="mb-4 flex flex-col gap-1">
              <ThemeButton
                selected={settings.theme === null}
                onClick={() => chooseTheme(null)}
                swatch={<span className="text-[0.7rem]">OS</span>}
                name="System default"
                hint="Follows your light or dark setting"
              />
              {THEMES.map((theme) => (
                <ThemeButton
                  key={theme.id}
                  selected={settings.theme === theme.id}
                  onClick={() => chooseTheme(theme.id)}
                  swatch={
                    <span
                      className="grid h-full w-full place-items-center rounded-[0.3rem] text-[0.8rem] font-bold"
                      style={{ background: theme.paper, color: theme.ink }}
                    >
                      A
                    </span>
                  }
                  name={theme.name}
                  hint={theme.hint}
                />
              ))}
            </div>

            <p className="mb-2 text-[0.66rem] uppercase tracking-[0.16em] text-muted">
              Type size
            </p>
            <div className="flex items-center gap-3 text-[0.72rem]">
              <input
                type="range"
                className="w-full accent-current disabled:opacity-40"
                min={READING_SIZE.min}
                max={READING_SIZE.max}
                step={READING_SIZE.step}
                value={settings.size}
                disabled={!settings.theme}
                aria-label={`Type size, ${settings.size} pixels`}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    size: Number(e.target.value),
                  }))
                }
              />
              <span aria-hidden>{settings.size}px</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[0.72rem]">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.dropCap}
                  disabled={!settings.theme}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      dropCap: e.target.checked,
                    }))
                  }
                />
                Drop cap
              </label>

              {active?.id === "kindle" && (
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.frontlight}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        frontlight: e.target.checked,
                      }))
                    }
                  />
                  Frontlight
                </label>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-rule bg-paper px-3.5 py-2.5 font-mono text-[0.78rem] text-ink shadow-lg"
        >
          <ScreenIcon />
          {active ? active.name : "Reading theme"}
        </button>
      </div>
    </>
  );
}

function ThemeButton({
  selected,
  onClick,
  swatch,
  name,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  swatch: React.ReactNode;
  name: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border p-1.5 text-left ${
        selected ? "border-current" : "border-transparent hover:border-rule"
      }`}
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[0.35rem] border border-rule">
        {swatch}
      </span>
      <span>
        <span className="block text-[0.76rem] leading-tight">{name}</span>
        <span className="block text-[0.64rem] leading-tight text-muted">
          {hint}
        </span>
      </span>
    </button>
  );
}

function ScreenIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}
