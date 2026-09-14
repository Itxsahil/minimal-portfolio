'use client';

import { useEffect, useMemo, useState } from 'react';
import palettes from './palettes.json';
import './island.css';

type Palette = (typeof palettes)[number];
type View = 'idle' | 'control' | 'launcher' | 'themes' | 'power';

/* Geometry taken from quickshell/modules/island/Island.qml: the pill is a
   capsule at idle, squares to 32 as the control center and 30 for a view. */
const SHAPE: Record<View, { w: number; h: number; r: number }> = {
  idle: { w: 196, h: 34, r: 17 },
  control: { w: 330, h: 200, r: 32 },
  launcher: { w: 330, h: 196, r: 30 },
  themes: { w: 330, h: 208, r: 30 },
  power: { w: 330, h: 100, r: 30 }
};

const VIEWS: { id: View; label: string; hint: string }[] = [
  { id: 'idle', label: 'Idle', hint: 'Wi-Fi, clock, battery' },
  { id: 'control', label: 'Control center', hint: 'Hover the pill' },
  { id: 'launcher', label: 'Launcher', hint: 'mod + Space' },
  { id: 'themes', label: 'Themes', hint: 'mod + T' },
  { id: 'power', label: 'Power', hint: 'mod + X' }
];

export function PotetoIsland() {
  const [themeIndex, setThemeIndex] = useState(
    Math.max(0, palettes.findIndex((p) => p.slug === 'tokyo-night-storm'))
  );
  const [view, setView] = useState<View>('idle');
  const [hovered, setHovered] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  // Rendered only after mount: a clock in the markup would not survive
  // hydration, and the server has no business guessing the reader's time.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const theme = palettes[themeIndex] as Palette;

  // Hovering the pill opens the control center, the way the shell does, but
  // only while no other view has been pinned.
  const shown: View = view === 'idle' && hovered ? 'control' : view;
  const shape = SHAPE[shown];

  const vars = useMemo(
    () =>
      ({
        '--pt-island': theme.island,
        '--pt-border': theme.border,
        '--pt-tile': theme.tile,
        '--pt-control': theme.control,
        '--pt-text': theme.text,
        '--pt-dim': theme.textDim,
        '--pt-accent': theme.accent,
        '--pt-on-accent': theme.onAccent,
        '--pt-success': theme.success,
        '--pt-warning': theme.warning,
        '--pt-danger': theme.danger,
        '--pt-desk': theme.variant === 'light' ? theme.tile : theme.island
      }) as React.CSSProperties,
    [theme]
  );

  const clock = now
    ? now
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        .replace(/\s*[AP]M$/i, '')
    : '—:—';

  return (
    <div style={vars}>
      <div className="poteto-stage">
        <div className="poteto-window" style={{ left: '8%', top: '34%', width: '38%', height: '52%' }} />
        <div className="poteto-window" style={{ right: '8%', top: '46%', width: '34%', height: '40%' }} />

        <div className="poteto-workspaces" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="poteto-ws" data-active={i === 1} />
          ))}
        </div>

        <div
          className="poteto-island"
          style={
            {
              '--pt-w': `${shape.w}px`,
              '--pt-h': `${shape.h}px`,
              '--pt-r': `${shape.r}px`
            } as React.CSSProperties
          }
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setView((v) => (v === 'idle' ? 'control' : 'idle'))}
          data-view={shown}
          role="img"
          aria-label={`poteto island, ${shown} view, ${theme.name} theme`}
        >
          <div className="poteto-island__body">
            <div className="poteto-view" data-shown={shown === 'idle'}>
              <div className="poteto-idle">
                <WifiGlyph />
                <span className="poteto-clock">{clock}</span>
                <BatteryGlyph level={0.72} color={theme.success} />
                <span className="poteto-unread" />
              </div>
            </div>

            <div className="poteto-view" data-shown={shown === 'control'}>
              <div className="poteto-tiles">
                <Tile label="Clock" value={clock} />
                <Tile label="Battery" value="72%" />
                <Tile label="Calendar" value="Mon 14" />
                <Tile label="Wi-Fi" value="Home" />
                <Tile label="Bluetooth" value="On" />
                <Tile label="Notifs" value="3" />
              </div>
              <div className="poteto-slider"><span style={{ width: '64%' }} /></div>
              <div className="poteto-slider"><span style={{ width: '38%' }} /></div>
            </div>

            <div className="poteto-view" data-shown={shown === 'launcher'}>
              <div>
              <div className="poteto-search">Search apps…</div>
              <div style={{ marginTop: 8 }}>
                {['kitty', 'neovim', 'Firefox', '48 × 1.5 = 72'].map((label, i) => (
                  <div key={label} className="poteto-result" data-selected={i === 0}>
                    <span className="poteto-result__glyph" />
                    {label}
                  </div>
                ))}
              </div>
              </div>
            </div>

            <div className="poteto-view" data-shown={shown === 'themes'}>
              <div className="poteto-swatches">
                {palettes.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    className="poteto-swatch"
                    aria-pressed={i === themeIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setThemeIndex(i);
                    }}
                  >
                    <span className="poteto-swatch__dots" aria-hidden>
                      <i style={{ background: p.island }} />
                      <i style={{ background: p.accent }} />
                      <i style={{ background: p.success }} />
                    </span>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="poteto-view" data-shown={shown === 'power'}>
              <div className="poteto-power">
                {[
                  ['L', 'Lock'],
                  ['E', 'Logout'],
                  ['S', 'Suspend'],
                  ['R', 'Reboot'],
                  ['P', 'Shutdown']
                ].map(([key, label]) => (
                  <span key={key} className="poteto-power__item">
                    <span className="poteto-power__key">{key}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="poteto-controls">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={view === v.id}
            title={v.hint}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 mb-0">
        Hover the pill to open the control center, or pick a view. The theme
        view carries poteto&rsquo;s nine real palettes, read from the
        repository.
      </p>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="poteto-tile">
      <span className="poteto-tile__label">{label}</span>
      <span className="poteto-tile__value">{value}</span>
    </div>
  );
}

function WifiGlyph() {
  return (
    <svg width="17" height="13" viewBox="0 0 17 13" fill="none" aria-hidden>
      <path d="M1 4.2a11 11 0 0 1 15 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 7.2a7 7 0 0 1 9 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.5" cy="10.8" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BatteryGlyph({ level, color }: { level: number; color: string }) {
  return (
    <svg width="24" height="13" viewBox="0 0 24 13" fill="none" aria-hidden>
      <rect x="0.7" y="0.7" width="19.6" height="11.6" rx="3" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.2" />
      <rect x="2.6" y="2.6" width={15.8 * level} height="7.8" rx="1.6" fill={color} />
      <path d="M22 4.5v4a2.2 2.2 0 0 0 0-4Z" fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}
