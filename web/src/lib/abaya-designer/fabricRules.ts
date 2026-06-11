import type { FabricType } from '@/types/abaya-designer/abaya';

export interface FabricRules {
  drape: 'low' | 'medium' | 'high';
  roughness: number;
  sheen: number;
  quantityMultiplier: number;
  productionNote: string;
  silhouetteSoftness: number;
}

const RULES: Record<FabricType, FabricRules> = {
  Nida: {
    drape: 'medium',
    roughness: 0.55,
    sheen: 0.15,
    quantityMultiplier: 1.0,
    productionNote: 'Nida: standard abaya weight — allow smooth hem sweep.',
    silhouetteSoftness: 0.55,
  },
  Crepe: {
    drape: 'medium',
    roughness: 0.72,
    sheen: 0.1,
    quantityMultiplier: 1.05,
    productionNote: 'Crepe: slightly structured — ease hem for clean fall.',
    silhouetteSoftness: 0.45,
  },
  Silk: {
    drape: 'high',
    roughness: 0.28,
    sheen: 0.85,
    quantityMultiplier: 1.15,
    productionNote: 'Silk: handle with care; extra fabric for flowing hem.',
    silhouetteSoftness: 0.85,
  },
  Satin: {
    drape: 'high',
    roughness: 0.22,
    sheen: 0.95,
    quantityMultiplier: 1.12,
    productionNote: 'Satin: glossy face — cut with nap direction consistent.',
    silhouetteSoftness: 0.8,
  },
  'Linen blend': {
    drape: 'low',
    roughness: 0.88,
    sheen: 0.05,
    quantityMultiplier: 1.08,
    productionNote: 'Linen blend: structured casual — pre-wash if required.',
    silhouetteSoftness: 0.35,
  },
  Polyester: {
    drape: 'medium',
    roughness: 0.65,
    sheen: 0.2,
    quantityMultiplier: 1.0,
    productionNote: 'Polyester: practical drape — standard seam finish.',
    silhouetteSoftness: 0.5,
  },
};

export function getFabricRules(fabric: FabricType): FabricRules {
  return RULES[fabric] ?? RULES.Nida;
}

export function materialPropsFromFabric(fabric: FabricType, colorHex: string) {
  const r = getFabricRules(fabric);
  return {
    color: colorHex,
    roughness: r.roughness,
    metalness: 0,
    sheen: r.sheen,
    clearcoat: fabric === 'Silk' || fabric === 'Satin' ? 0.15 : 0,
  };
}
