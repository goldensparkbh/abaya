import type { GarmentMeasurements, StyleSelections } from '@/types/abaya-designer/abaya';
import type { PatternData } from '@/types/abaya-designer/pattern';

export function generatePattern(
  garment: GarmentMeasurements,
  style: StyleSelections
): PatternData {
  const hemAllowanceCm = 3;
  const seamAllowanceCm = garment.seamAllowanceCm;

  const sleeveUpper = garment.sleeveOpening + 8;
  const sleeveCuff =
    style.sleeveStyle === 'cuffed'
      ? garment.sleeveOpening + 4
      : style.sleeveStyle === 'flared'
        ? garment.sleeveOpening + 14
        : style.sleeveStyle === 'wide'
          ? garment.sleeveOpening + 10
          : garment.sleeveOpening + 6;

  const necklineDepth =
    style.neckline === 'v_neck' ? 12 : style.neckline === 'collar' ? 8 : style.neckline === 'open' ? 6 : 10;

  const cuttingNotes: string[] = [
    'Cut front and back on fold where noted; mirror for symmetry.',
    `Include ${seamAllowanceCm} cm seam allowance on all vertical seams.`,
    `Hem allowance: ${hemAllowanceCm} cm.`,
    'Mark shoulder notch and sleeve cap alignment.',
  ];

  if (style.abayaStyle === 'butterfly') {
    cuttingNotes.push('Butterfly style: widen side seam flare — do not taper below hip.');
  }
  if (style.abayaStyle === 'kimono') {
    cuttingNotes.push('Kimono style: continuous front/back shoulder line; no shoulder seam if possible.');
  }
  if (style.abayaStyle === 'open_front') {
    cuttingNotes.push('Open front: cut front panels as pair with center front edge finished.');
  }

  const qualityChecklist = [
    'Verify bust ease ≥ body bust + 16 cm before cutting.',
    'Verify chest ease ≥ body chest + 14 cm before cutting.',
    'Verify hip ease ≥ body + 18 cm.',
    'Sleeve opening must slide over hand without tightness.',
    'Hem level and length checked against garment length spec.',
    'Embroidery placement marked and approved.',
    'Closure placement aligned to center front.',
    'Final press and quality check before delivery.',
  ];

  return {
    frontPanel: {
      widthCm: garment.frontPanelWidth,
      lengthCm: garment.garmentLength + hemAllowanceCm,
      notes: style.abayaStyle === 'open_front' ? 'Pair — center front edge' : 'Cut on fold',
    },
    backPanel: {
      widthCm: garment.backPanelWidth,
      lengthCm: garment.garmentLength + hemAllowanceCm,
      notes: 'Cut on fold',
    },
    leftSleeve: {
      lengthCm: garment.sleeveLength,
      upperWidthCm: sleeveUpper,
      cuffWidthCm: sleeveCuff,
      notes: `${style.sleeveStyle} sleeve`,
    },
    rightSleeve: {
      lengthCm: garment.sleeveLength,
      upperWidthCm: sleeveUpper,
      cuffWidthCm: sleeveCuff,
      notes: `${style.sleeveStyle} sleeve — mirror of left`,
    },
    neckline: {
      style: style.neckline,
      openingWidthCm: garment.shoulderWidth * 0.45,
      depthCm: necklineDepth,
    },
    closure: {
      type: style.closure,
      lengthCm: style.closure === 'none' ? 0 : garment.garmentLength * 0.55,
      placementNotes:
        style.closure === 'none'
          ? 'No closure — pullover construction'
          : 'Center front from neckline to mid-chest or full length per style',
    },
    hemAllowanceCm,
    seamAllowanceCm,
    cuttingNotes,
    qualityChecklist,
  };
}

/** Structured for future DXF/AAMA export — flat panel list. */
export function patternToCutList(pattern: PatternData): { name: string; w: number; h: number; note?: string }[] {
  return [
    { name: 'Front panel', w: pattern.frontPanel.widthCm, h: pattern.frontPanel.lengthCm, note: pattern.frontPanel.notes },
    { name: 'Back panel', w: pattern.backPanel.widthCm, h: pattern.backPanel.lengthCm, note: pattern.backPanel.notes },
    { name: 'Left sleeve', w: pattern.leftSleeve.upperWidthCm, h: pattern.leftSleeve.lengthCm, note: pattern.leftSleeve.notes },
    { name: 'Right sleeve', w: pattern.rightSleeve.upperWidthCm, h: pattern.rightSleeve.lengthCm, note: pattern.rightSleeve.notes },
  ];
}
