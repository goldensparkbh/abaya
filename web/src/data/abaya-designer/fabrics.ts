import type { FabricType } from '@/types/abaya-designer/abaya';

export interface FabricDefinition {
  id: FabricType;
  label: string;
  description: string;
  drape: 'low' | 'medium' | 'high';
  roughness: number;
  sheen: number;
  recommendedFor: string[];
}

export const FABRICS: FabricDefinition[] = [
  {
    id: 'Nida',
    label: 'Nida',
    description: 'Smooth drape — standard abaya fabric for daily and formal wear.',
    drape: 'medium',
    roughness: 0.55,
    sheen: 0.15,
    recommendedFor: ['daily', 'formal'],
  },
  {
    id: 'Crepe',
    label: 'Crepe',
    description: 'More structured with medium drape.',
    drape: 'medium',
    roughness: 0.72,
    sheen: 0.1,
    recommendedFor: ['formal', 'daily'],
  },
  {
    id: 'Silk',
    label: 'Silk',
    description: 'Soft, premium, flowing drape.',
    drape: 'high',
    roughness: 0.28,
    sheen: 0.85,
    recommendedFor: ['formal'],
  },
  {
    id: 'Satin',
    label: 'Satin',
    description: 'Glossy surface with flowing movement.',
    drape: 'high',
    roughness: 0.22,
    sheen: 0.95,
    recommendedFor: ['formal'],
  },
  {
    id: 'Linen blend',
    label: 'Linen blend',
    description: 'Structured, casual daytime feel.',
    drape: 'low',
    roughness: 0.88,
    sheen: 0.05,
    recommendedFor: ['daily'],
  },
  {
    id: 'Polyester',
    label: 'Polyester',
    description: 'Practical everyday fabric with medium drape.',
    drape: 'medium',
    roughness: 0.65,
    sheen: 0.2,
    recommendedFor: ['daily'],
  },
];

export const COLOR_SWATCHES = [
  { name: 'Black', hex: '#1c1c1e' },
  { name: 'Charcoal', hex: '#3b3f44' },
  { name: 'Navy', hex: '#1f2a44' },
  { name: 'Olive', hex: '#4d563a' },
  { name: 'Stone', hex: '#b8a994' },
  { name: 'Plum', hex: '#5a2d3b' },
  { name: 'Custom', hex: '#7a5a8a' },
];
