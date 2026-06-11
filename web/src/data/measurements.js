export const MEASUREMENT_KEYS = [
  'shoulder',
  'bust',
  'waist',
  'hip',
  'length',
  'sleeve',
  'armhole',
  'neck',
];

export const MEASUREMENT_LABELS = {
  en: {
    shoulder: 'Shoulder width',
    bust: 'Bust',
    waist: 'Waist',
    hip: 'Hip',
    length: 'Abaya length',
    sleeve: 'Sleeve length',
    armhole: 'Armhole',
    neck: 'Neck',
  },
  ar: {
    shoulder: 'عرض الكتف',
    bust: 'محيط الصدر',
    waist: 'محيط الخصر',
    hip: 'محيط الورك',
    length: 'طول العباية',
    sleeve: 'طول الكم',
    armhole: 'فتحة الذراع',
    neck: 'محيط الرقبة',
  },
};

export const MEASUREMENT_RANGES = {
  shoulder: { min: 30, max: 55, default: 40, step: 0.5 },
  bust: { min: 70, max: 130, default: 90, step: 0.5 },
  waist: { min: 60, max: 120, default: 75, step: 0.5 },
  hip: { min: 75, max: 140, default: 95, step: 0.5 },
  length: { min: 110, max: 180, default: 145, step: 0.5 },
  sleeve: { min: 45, max: 75, default: 60, step: 0.5 },
  armhole: { min: 32, max: 55, default: 42, step: 0.5 },
  neck: { min: 28, max: 50, default: 36, step: 0.5 },
};

export function defaultMeasurements() {
  return Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, MEASUREMENT_RANGES[k].default]));
}
