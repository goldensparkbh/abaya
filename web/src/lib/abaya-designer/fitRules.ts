import type { BodyMeasurements } from '@/types/abaya-designer/measurements';
import type { FitType, GarmentMeasurements, StyleSelections } from '@/types/abaya-designer/abaya';
import type { FabricType } from '@/types/abaya-designer/abaya';
import { getFabricRules } from './fabricRules';

export interface EaseRules {
  chest: number;
  bust: number;
  waist: number;
  hip: number;
  sleeve: number;
  shoulder: number;
}

const EASE_BY_FIT: Record<FitType, EaseRules> = {
  normal: { chest: 16, bust: 18, waist: 20, hip: 22, sleeve: 8, shoulder: 1 },
  loose: { chest: 22, bust: 24, waist: 28, hip: 30, sleeve: 10, shoulder: 2 },
  very_loose: { chest: 30, bust: 34, waist: 36, hip: 40, sleeve: 12, shoulder: 3 },
};

/** Minimum safety eases — garment must never be tighter than these. */
const MIN_CHEST_EASE = 14;
const MIN_BUST_EASE = 16;
const MIN_HIP_EASE = 18;
const MIN_SLEEVE_OPENING_EASE = 6;

function resolveGarmentLength(body: BodyMeasurements, style: StyleSelections): number {
  if (style.lengthPreference === 'ankle') {
    return Math.min(body.desiredAbayaLength, body.height * 0.88);
  }
  if (style.lengthPreference === 'floor') {
    return Math.max(body.desiredAbayaLength, body.height * 0.92);
  }
  return body.desiredAbayaLength;
}

function sleeveOpening(body: BodyMeasurements, ease: EaseRules): number {
  const raw = body.wristCircumference + ease.sleeve;
  return Math.max(raw, body.wristCircumference + MIN_SLEEVE_OPENING_EASE);
}

function fabricQuantityMeters(garmentLength: number, hip: number, style: StyleSelections, fabric: FabricType): number {
  const rules = getFabricRules(fabric);
  const widthFactor = style.abayaStyle === 'butterfly' ? 2.4 : style.abayaStyle === 'kimono' ? 2.1 : 1.85;
  const base = (garmentLength / 100) * widthFactor * rules.quantityMultiplier;
  return Math.ceil(base * 10) / 10;
}

export function calculateGarmentMeasurements(
  body: BodyMeasurements,
  fit: FitType,
  style: StyleSelections,
  fabric: FabricType
): GarmentMeasurements {
  const ease = EASE_BY_FIT[fit];

  let chest = body.chestCircumference + ease.chest;
  let bust = body.bustCircumference + ease.bust;
  let waist = body.waistCircumference + ease.waist;
  let hip = body.hipCircumference + ease.hip;

  chest = Math.max(chest, body.chestCircumference + MIN_CHEST_EASE);
  bust = Math.max(bust, body.bustCircumference + MIN_BUST_EASE);
  bust = Math.max(bust, chest);
  waist = Math.max(waist, body.waistCircumference + ease.waist);
  hip = Math.max(hip, body.hipCircumference + MIN_HIP_EASE);

  const shoulderWidth = body.shoulderWidth + ease.shoulder;
  const sleeveLength = body.armLength + ease.sleeve * 0.5;
  const sleeveOpeningCm = sleeveOpening(body, ease);
  const garmentLength = resolveGarmentLength(body, style);

  const hemWidth = hip + (style.abayaStyle === 'butterfly' ? 18 : style.abayaStyle === 'kimono' ? 12 : 8);
  const frontPanelWidth = hemWidth / 2 + 2;
  const backPanelWidth = hemWidth / 2 + 2;
  const seamAllowanceCm = 1.5;

  const fabricRules = getFabricRules(fabric);
  const tailorNotes: string[] = [
    `Fit: ${fit.replace('_', ' ')} with modest ease applied.`,
    `Bust block: ${round1(bust)} cm (body bust ${body.bustCircumference} cm + ease).`,
    `Style: ${style.abayaStyle.replace('_', ' ')} — maintain loose silhouette, never pull tight at hip or bust.`,
    fabricRules.productionNote,
  ];

  if (style.abayaStyle === 'open_front') {
    tailorNotes.push('Open front: leave center front overlap 8–12 cm for modest closure if needed.');
  }
  if (style.embroidery !== 'none') {
    tailorNotes.push(`Embroidery: ${style.embroidery.replace('_', ' ')} — mark placement before cutting.`);
  }
  if (style.closure !== 'none') {
    tailorNotes.push(`Closure: ${style.closure.replace('_', ' ')} — reinforce placket.`);
  }

  return {
    chestCircumference: round1(chest),
    bustCircumference: round1(bust),
    waistCircumference: round1(waist),
    hipCircumference: round1(hip),
    shoulderWidth: round1(shoulderWidth),
    sleeveLength: round1(sleeveLength),
    sleeveOpening: round1(sleeveOpeningCm),
    garmentLength: round1(garmentLength),
    frontPanelWidth: round1(frontPanelWidth),
    backPanelWidth: round1(backPanelWidth),
    hemWidth: round1(hemWidth),
    fabricQuantityMeters: fabricQuantityMeters(garmentLength, hip, style, fabric),
    seamAllowanceCm,
    tailorNotes,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function getFitLabel(fit: FitType): string {
  const map: Record<FitType, string> = {
    normal: 'Comfort Fit',
    loose: 'Loose Modest Fit',
    very_loose: 'Very Loose Fit',
  };
  return map[fit];
}
