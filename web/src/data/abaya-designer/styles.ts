import type {
  AbayaStyle,
  ClosureType,
  EmbroideryOption,
  FitType,
  LengthPreference,
  NecklineStyle,
  SleeveStyle,
} from '@/types/abaya-designer/abaya';

export const FIT_OPTIONS: { id: FitType; label: string; description: string }[] = [
  { id: 'normal', label: 'Comfort Fit', description: 'Modest ease for everyday wear.' },
  { id: 'loose', label: 'Loose Modest Fit', description: 'Generous drape with extra room.' },
  { id: 'very_loose', label: 'Very Loose Fit', description: 'Maximum modest volume and flow.' },
];

export const ABAYA_STYLES: { id: AbayaStyle; label: string }[] = [
  { id: 'classic_closed', label: 'Classic closed' },
  { id: 'open_front', label: 'Open front' },
  { id: 'butterfly', label: 'Butterfly' },
  { id: 'kimono', label: 'Kimono' },
  { id: 'formal', label: 'Formal' },
  { id: 'daily', label: 'Daily' },
];

export const SLEEVE_STYLES: { id: SleeveStyle; label: string }[] = [
  { id: 'straight', label: 'Straight' },
  { id: 'wide', label: 'Wide' },
  { id: 'cuffed', label: 'Cuffed' },
  { id: 'flared', label: 'Flared' },
];

export const NECKLINES: { id: NecklineStyle; label: string }[] = [
  { id: 'round', label: 'Round' },
  { id: 'v_neck', label: 'V-neck' },
  { id: 'collar', label: 'Collar' },
  { id: 'open', label: 'Open' },
];

export const CLOSURES: { id: ClosureType; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'hidden_buttons', label: 'Hidden buttons' },
  { id: 'zipper', label: 'Zipper' },
];

export const EMBROIDERY_OPTIONS: { id: EmbroideryOption; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'sleeve', label: 'Sleeve embroidery' },
  { id: 'front', label: 'Front embroidery' },
  { id: 'border', label: 'Border embroidery' },
  { id: 'full_border', label: 'Full border' },
];

export const LENGTH_PREFERENCES: { id: LengthPreference; label: string }[] = [
  { id: 'ankle', label: 'Ankle length' },
  { id: 'floor', label: 'Floor length' },
  { id: 'custom', label: 'Custom (use entered length)' },
];
