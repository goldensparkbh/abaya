export interface PanelDimensions {
  widthCm: number;
  lengthCm: number;
  notes?: string;
}

export interface SleevePanelDimensions {
  lengthCm: number;
  upperWidthCm: number;
  cuffWidthCm: number;
  notes?: string;
}

export interface NecklineDimensions {
  style: string;
  openingWidthCm: number;
  depthCm: number;
}

export interface ClosureDimensions {
  type: string;
  lengthCm: number;
  placementNotes: string;
}

export interface PatternData {
  frontPanel: PanelDimensions;
  backPanel: PanelDimensions;
  leftSleeve: SleevePanelDimensions;
  rightSleeve: SleevePanelDimensions;
  neckline: NecklineDimensions;
  closure: ClosureDimensions;
  hemAllowanceCm: number;
  seamAllowanceCm: number;
  cuttingNotes: string[];
  qualityChecklist: string[];
}
