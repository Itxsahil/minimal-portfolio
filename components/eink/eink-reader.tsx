'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  DEFAULT_PROFILE,
  FONT_SIZE,
  PROFILES,
  REFRESH_MS,
  isArticlePath,
  type ProfileId
} from './profiles';
import './eink.css';

const STORAGE_KEY = 'eink-reader';

type Settings = {
  active: boolean;
  profile: ProfileId;
  fontSize: number;
  dropCap: boolean;
  amber: boolean;
};

const DEFAULTS: Settings = {
  active: false,
  profile: DEFAULT_PROFILE,
  fontSize: FONT_SIZE.default,
  dropCap: false,
  amber: true
};

/** A reading face downloads the first time its profile is chosen. Switching
 *  before it arrives reflows the article in full view, so the swap waits for
 *  the font and happens behind the opaque part of the refresh flash. The cap
 *  keeps a slow network from stalling the switch. */
function waitForFont(family: string | undefined, capMs: number): Promise<void> {
  const cap = new Promise<void>((resolve) => setTimeout(resolve, capMs));
  if (!family || typeof document === 'undefined' || !('fonts' in document)) {
    return cap;
  }
  const loaded = document.fonts
    .load(`1rem "${family}"`)
    .then(() => undefined)
    .catch(() => undefined);
  return Promise.race([loaded, cap]);
}

function readStored(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const known = PROFILES.some((p) => p.id === parsed.profile);
    return {
      active: parsed.active === true,
      profile: known ? (parsed.profile as ProfileId) : DEFAULTS.profile,
      fontSize:
        typeof parsed.fontSize === 'number'
          ? Math.min(FONT_SIZE.max, Math.max(FONT_SIZE.min, parsed.fontSize))
          : DEFAULTS.fontSize,
      dropCap: parsed.dropCap === true,
      amber: parsed.amber !== false
    };
  } catch {
    return DEFAULTS;
  }
}

export function EInkReader({
  fontClassName,
  children
}: {
  fontClassName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const onArticle = isArticlePath(pathname);

  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Pick up the saved choice after mount. The inline script in the layout has
  // already painted it, so this only syncs React's copy of the state.
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

  // Drive <html>, so the paper reaches the footer and the page margins too.
  useEffect(() => {
    const root = document.documentElement;
    const live = onArticle && settings.active;

    if (!live) {
      root.removeAttribute('data-eink');
      root.removeAttribute('data-eink-profile');
      root.removeAttribute('data-eink-dropcap');
      root.removeAttribute('data-eink-amber');
      for (const prop of ['--eink-bg', '--eink-ink', '--eink-size']) {
        root.style.removeProperty(prop);
      }
      return;
    }

    const profile =
      PROFILES.find((p) => p.id === settings.profile) ?? PROFILES[0];

    root.setAttribute('data-eink', 'on');
    root.setAttribute('data-eink-profile', profile.id);
    root.setAttribute('data-eink-dropcap', settings.dropCap ? 'on' : 'off');
    root.setAttribute('data-eink-amber', settings.amber ? 'on' : 'off');
    root.style.setProperty('--eink-bg', profile.bg);
    root.style.setProperty('--eink-ink', profile.ink);
    root.style.setProperty('--eink-size', `${settings.fontSize}px`);
  }, [onArticle, settings]);

  // Leaving the article pages entirely must hand the site back as it was.
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      root.removeAttribute('data-eink');
      root.removeAttribute('data-eink-profile');
      root.removeAttribute('data-eink-dropcap');
      root.removeAttribute('data-eink-amber');
    };
  }, []);

  // The first paragraph of an article is preceded by the title and the date
  // line, so the drop cap target is the first paragraph with real prose in it.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    for (const p of Array.from(root.querySelectorAll('p[data-eink-dropcap]'))) {
      p.removeAttribute('data-eink-dropcap');
    }
    if (!(onArticle && settings.active && settings.dropCap)) return;

    const target = Array.from(root.querySelectorAll('p')).find(
      (p) => (p.textContent ?? '').trim().length > 80
    );
    target?.setAttribute('data-eink-dropcap', '');
  }, [onArticle, settings.active, settings.dropCap, settings.profile, pathname]);

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), []);

  const update = useCallback(
    (patch: Partial<Settings>, withRefresh: boolean) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      if (withRefresh) refresh();
    },
    [refresh]
  );

  const chooseProfile = useCallback(
    async (id: ProfileId) => {
      refresh();
      await waitForFont(PROFILES.find((p) => p.id === id)?.family, 260);
      setSettings((prev) => ({ ...prev, active: true, profile: id }));
    },
    [refresh]
  );

  if (!onArticle) return <>{children}</>;

  const activeProfile =
    PROFILES.find((p) => p.id === settings.profile) ?? PROFILES[0];

  return (
    <div className={`eink-shell ${fontClassName}`}>
      {settings.active && (
        <>
          <div className="eink-layer eink-layer--texture" aria-hidden />
          <div className="eink-layer eink-layer--tint" aria-hidden />
        </>
      )}

      {refreshKey > 0 && (
        <div
          key={refreshKey}
          className="eink-refresh"
          aria-hidden
          style={{ ['--eink-refresh-ms' as string]: `${REFRESH_MS}ms` }}
          onAnimationEnd={(e) => {
            // The sweep band ends at the same moment; only the panel waveform
            // retires the overlay, so no dead fixed element is left behind.
            if (e.animationName.includes('waveform')) setRefreshKey(0);
          }}
        />
      )}

      <div className="eink-content" ref={contentRef}>
        {children}
      </div>

      <div className="eink-dock">
        {panelOpen && (
          <div className="eink-panel" role="group" aria-label="E-Ink reading mode">
            <p className="eink-panel__label">Display profile</p>
            <div className="eink-profiles">
              {PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className="eink-profile"
                  aria-pressed={settings.active && settings.profile === profile.id}
                  onClick={() => chooseProfile(profile.id)}
                >
                  <span
                    className="eink-swatch"
                    style={{ background: profile.bg, color: profile.ink }}
                    aria-hidden
                  >
                    A
                  </span>
                  <span>
                    <span className="eink-profile__name">{profile.name}</span>
                    <br />
                    <span className="eink-profile__hint">{profile.hint}</span>
                  </span>
                </button>
              ))}
            </div>

            <p className="eink-panel__label">Type size</p>
            <div className="eink-row">
              <input
                type="range"
                min={FONT_SIZE.min}
                max={FONT_SIZE.max}
                step={FONT_SIZE.step}
                value={settings.fontSize}
                disabled={!settings.active}
                aria-label={`Font size, ${settings.fontSize} pixels`}
                onChange={(e) =>
                  update({ fontSize: Number(e.target.value) }, false)
                }
              />
              <span aria-hidden>{settings.fontSize}px</span>
            </div>

            <div className="eink-row">
              <label className="eink-switch">
                <input
                  type="checkbox"
                  checked={settings.dropCap}
                  disabled={!settings.active}
                  onChange={(e) => update({ dropCap: e.target.checked }, false)}
                />
                Drop cap
              </label>

              {activeProfile.id === 'kindle' && (
                <label className="eink-switch">
                  <input
                    type="checkbox"
                    checked={settings.amber}
                    disabled={!settings.active}
                    onChange={(e) => update({ amber: e.target.checked }, false)}
                  />
                  Frontlight
                </label>
              )}
            </div>

            {settings.active && (
              <button
                type="button"
                className="eink-exit"
                onClick={() => update({ active: false }, true)}
              >
                Leave reading mode
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          className="eink-trigger"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((open) => !open)}
        >
          <ScreenIcon />
          {settings.active ? activeProfile.name : 'E-Ink reading mode'}
        </button>
      </div>
    </div>
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
