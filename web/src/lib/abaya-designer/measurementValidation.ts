import type { BodyMeasurements } from '@/types/abaya-designer/measurements';
import type { MeasurementValidationError } from '@/types/abaya-designer/measurements';

const RANGES: Record<keyof BodyMeasurements, { min: number; max: number; label: string } | undefined> = {
  height: { min: 120, max: 220, label: 'Height' },
  shoulderWidth: { min: 25, max: 70, label: 'Shoulder width' },
  chestCircumference: { min: 50, max: 180, label: 'Chest (under bust)' },
  bustCircumference: { min: 50, max: 200, label: 'Bust (fullest part)' },
  waistCircumference: { min: 45, max: 180, label: 'Waist' },
  hipCircumference: { min: 50, max: 200, label: 'Hip' },
  armLength: { min: 35, max: 90, label: 'Arm length' },
  upperArmCircumference: { min: 18, max: 60, label: 'Upper arm' },
  wristCircumference: { min: 12, max: 30, label: 'Wrist' },
  desiredAbayaLength: { min: 80, max: 200, label: 'Abaya length' },
  neckCircumference: { min: 28, max: 55, label: 'Neck' },
};

export function validateMeasurements(
  body: BodyMeasurements,
  customerName?: string
): MeasurementValidationError[] {
  const errors: MeasurementValidationError[] = [];

  if (!customerName?.trim()) {
    errors.push({ field: 'customer.name', message: 'Customer name is required.' });
  }

  (Object.keys(RANGES) as (keyof BodyMeasurements)[]).forEach((key) => {
    const rule = RANGES[key];
    if (!rule) return;
    const val = body[key];
    if (val == null || Number.isNaN(Number(val))) {
      errors.push({ field: key, message: `${rule.label} is required.` });
      return;
    }
    const n = Number(val);
    if (n < rule.min || n > rule.max) {
      errors.push({
        field: key,
        message: `${rule.label} must be between ${rule.min} and ${rule.max} cm.`,
      });
    }
  });

  if (body.desiredAbayaLength > body.height * 1.05) {
    errors.push({
      field: 'desiredAbayaLength',
      message: 'Abaya length cannot exceed height by more than 5%.',
    });
  }
  if (body.desiredAbayaLength < body.height * 0.5) {
    errors.push({
      field: 'desiredAbayaLength',
      message: 'Abaya length seems too short for the entered height.',
    });
  }
  if (body.bustCircumference < body.chestCircumference) {
    errors.push({
      field: 'bustCircumference',
      message: 'Bust measurement is usually equal to or larger than chest (under bust).',
    });
  }
  if (body.bustCircumference > body.chestCircumference + 25) {
    errors.push({
      field: 'bustCircumference',
      message: 'Bust seems unusually large compared to chest — please double-check.',
    });
  }
  if (body.chestCircumference > body.hipCircumference + 25) {
    errors.push({
      field: 'chestCircumference',
      message: 'Chest measurement seems unusually large compared to hip.',
    });
  }
  if (body.waistCircumference > body.hipCircumference + 15) {
    errors.push({
      field: 'waistCircumference',
      message: 'Waist cannot be much larger than hip for abaya block.',
    });
  }

  return errors;
}

export function fieldError(
  errors: MeasurementValidationError[],
  field: MeasurementValidationError['field']
): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}
