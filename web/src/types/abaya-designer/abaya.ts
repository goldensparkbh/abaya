import type { BodyMeasurements, CustomerInfo } from './measurements';
import { EMPTY_BODY_MEASUREMENTS } from './measurements';
import type { PatternData } from './pattern';

export type FitType = 'normal' | 'loose' | 'very_loose';

export type AbayaStyle =
  | 'classic_closed'
  | 'open_front'
  | 'butterfly'
  | 'kimono'
  | 'formal'
  | 'daily';

export type SleeveStyle = 'straight' | 'wide' | 'cuffed' | 'flared';

export type NecklineStyle = 'round' | 'v_neck' | 'collar' | 'open';

export type ClosureType = 'none' | 'buttons' | 'hidden_buttons' | 'zipper';

export type EmbroideryOption =
  | 'none'
  | 'sleeve'
  | 'front'
  | 'border'
  | 'full_border';

export type LengthPreference = 'ankle' | 'floor' | 'custom';

export type FabricType = 'Nida' | 'Crepe' | 'Silk' | 'Satin' | 'Linen blend' | 'Polyester';

export interface StyleSelections {
  abayaStyle: AbayaStyle;
  sleeveStyle: SleeveStyle;
  neckline: NecklineStyle;
  closure: ClosureType;
  embroidery: EmbroideryOption;
  lengthPreference: LengthPreference;
}

export interface FabricSelections {
  fabric: FabricType;
  color: string;
  colorHex: string;
}

export interface GarmentMeasurements {
  chestCircumference: number;
  bustCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
  shoulderWidth: number;
  sleeveLength: number;
  sleeveOpening: number;
  garmentLength: number;
  frontPanelWidth: number;
  backPanelWidth: number;
  hemWidth: number;
  fabricQuantityMeters: number;
  seamAllowanceCm: number;
  tailorNotes: string[];
}

export type DesignerStep = 'measurements' | 'style' | 'fabric' | 'preview' | 'production';

export interface AbayaDesignState {
  step: DesignerStep;
  customer: CustomerInfo;
  body: BodyMeasurements;
  fit: FitType;
  style: StyleSelections;
  fabric: FabricSelections;
  garment: GarmentMeasurements | null;
  pattern: PatternData | null;
}

export interface AbayaDesignerModuleProps {
  initialData?: Partial<AbayaDesignState>;
  onDesignChange?: (data: AbayaDesignState) => void;
  onSubmitDesign?: (data: AbayaDesignState) => void;
  brandColor?: string;
}

export const DEFAULT_STYLE: StyleSelections = {
  abayaStyle: 'classic_closed',
  sleeveStyle: 'straight',
  neckline: 'round',
  closure: 'none',
  embroidery: 'none',
  lengthPreference: 'floor',
};

export const DEFAULT_FABRIC: FabricSelections = {
  fabric: 'Nida',
  color: 'Black',
  colorHex: '#1c1c1e',
};

export function createInitialDesignState(partial?: Partial<AbayaDesignState>): AbayaDesignState {
  return {
    step: partial?.step ?? 'measurements',
    customer: {
      name: partial?.customer?.name ?? '',
      phone: partial?.customer?.phone ?? '',
      orderReference: partial?.customer?.orderReference ?? '',
    },
    body: { ...EMPTY_BODY_MEASUREMENTS, ...partial?.body },
    fit: partial?.fit ?? 'normal',
    style: { ...DEFAULT_STYLE, ...(partial?.style ?? {}) },
    fabric: { ...DEFAULT_FABRIC, ...(partial?.fabric ?? {}) },
    garment: partial?.garment ?? null,
    pattern: partial?.pattern ?? null,
  };
}
