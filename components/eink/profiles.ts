export type ProfileId =
  | 'remarkable'
  | 'kindle'
  | 'boox'
  | 'newsprint'
  | 'carbon';

export type Profile = {
  id: ProfileId;
  name: string;
  /** Shown under the name in the panel. */
  hint: string;
  bg: string;
  ink: string;
};

export const PROFILES: Profile[] = [
  {
    id: 'remarkable',
    name: 'reMarkable Tablet',
    hint: 'Linen paper, warm grey',
    bg: '#ECE9E2',
    ink: '#181816'
  },
  {
    id: 'kindle',
    name: 'Kindle Warm Light',
    hint: 'Justified, amber frontlight',
    bg: '#F6F1E5',
    ink: '#121210'
  },
  {
    id: 'boox',
    name: 'Boox Modern Stark',
    hint: 'High contrast sans',
    bg: '#FBFBFA',
    ink: '#080808'
  },
  {
    id: 'newsprint',
    name: '1-Bit Newsprint',
    hint: 'Dithered dot matrix',
    bg: '#EFEBE0',
    ink: '#0F0F0E'
  },
  {
    id: 'carbon',
    name: 'Carbon Inverted Slate',
    hint: 'Ink on black, night reading',
    bg: '#171716',
    ink: '#EAE6DC'
  }
];

export const DEFAULT_PROFILE: ProfileId = 'remarkable';

export const FONT_SIZE = { min: 16, max: 24, step: 1, default: 19 };

/** How long the screen-refresh flash runs, in milliseconds. */
export const REFRESH_MS = 420;

/** Only article routes get the reader: /b/1, not /b and not /b/1/anything-else. */
export function isArticlePath(pathname: string | null) {
  if (!pathname) return false;
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  return segments.length === 2 && segments[0] === 'b';
}
