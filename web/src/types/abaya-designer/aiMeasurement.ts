/**
 * Future AI photo-based body measurement types.
 * NOT implemented in MVP — placeholder for MediaPipe Pose, SMPL/SMPL-X, OpenPose, etc.
 */

export interface PhotoCapture {
  /** Front-facing full-body photo (base64 or URL). */
  frontPhoto?: string;
  /** Side profile photo (base64 or URL). */
  sidePhoto?: string;
  /** Known height in cm for scale calibration. */
  heightCm?: number;
}

export interface EstimatedMeasurements {
  shoulderWidth?: number;
  chestCircumference?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  armLength?: number;
  desiredAbayaLength?: number;
}

export interface AIMeasurementResult {
  captures: PhotoCapture;
  estimated: EstimatedMeasurements;
  /** 0–1 confidence per field or overall. */
  confidence: number;
  /** True when human review is required before production. */
  manualCorrectionRequired: boolean;
  /** Pipeline identifier for future backend routing. */
  pipeline?: 'mediapipe_pose' | 'smpl_x' | 'openpose' | 'custom_model';
  disclaimer: string;
}

export const AI_MEASUREMENT_DISCLAIMER =
  'Photo-based measurements are estimates only. A tailor must verify all dimensions before cutting.';
