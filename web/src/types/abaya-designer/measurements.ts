/** Body measurements entered by the customer (centimeters). */
export interface BodyMeasurements {
  height: number;
  shoulderWidth: number;
  chestCircumference: number;
  /** Full bust circumference (fullest part of the chest). */
  bustCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
  armLength: number;
  upperArmCircumference: number;
  wristCircumference: number;
  desiredAbayaLength: number;
  neckCircumference?: number;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  orderReference?: string;
}

export type MeasurementField = keyof BodyMeasurements;

export interface MeasurementValidationError {
  field: MeasurementField | 'customer.name';
  message: string;
}

export const EMPTY_BODY_MEASUREMENTS: BodyMeasurements = {
  height: 165,
  shoulderWidth: 40,
  chestCircumference: 90,
  bustCircumference: 96,
  waistCircumference: 75,
  hipCircumference: 95,
  armLength: 58,
  upperArmCircumference: 28,
  wristCircumference: 16,
  desiredAbayaLength: 140,
  neckCircumference: 36,
};

export const EMPTY_CUSTOMER: CustomerInfo = {
  name: '',
  phone: '',
  orderReference: '',
};
