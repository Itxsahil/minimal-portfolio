export type ThemeId =
  | 'remarkable'
  | 'kindle'
  | 'boox'
  | 'newsprint'
  | 'carbon';

export type Theme = {
  id: ThemeId;
  name: string;
  hint: string;
  /** Swatch only. The real palette lives in globals.css as theme tokens. */
  paper: string;
  ink: string;
  /** Family to wait for before switching, so the swap does not reflow in view. */
  family: string;
};

export const THEMES: Theme[] = [
  {
    id: 'remarkable',
    name: 'reMarkable Tablet',
    hint: 'Linen paper, warm grey',
    paper: '#ECE9E2',
    ink: '#181816',
    family: 'Newsreader'
  },
  {
    id: 'kindle',
    name: 'Kindle Warm Light',
    hint: 'Justified, amber frontlight',
    paper: '#F6F1E5',
    ink: '#121210',
    family: 'Literata'
  },
  {
    id: 'boox',
    name: 'Boox Modern Stark',
    hint: 'High contrast sans',
    paper: '#FBFBFA',
    ink: '#080808',
    family: 'Inter'
  },
  {
    id: 'newsprint',
    name: '1-Bit Newsprint',
    hint: 'Dithered dot matrix',
    paper: '#EFEBE0',
    ink: '#0F0F0E',
    family: 'EB Garamond'
  },
  {
    id: 'carbon',
    name: 'Carbon Inverted Slate',
    hint: 'Ink on black, night reading',
    paper: '#171716',
    ink: '#EAE6DC',
    family: 'STIX Two Text'
  }
];

export const READING_SIZE = { min: 16, max: 24, step: 1, default: 19 };

/** How long the screen-refresh runs, in milliseconds. */
export const REFRESH_MS = 420;

export const STORAGE_KEY = 'reading-theme';
