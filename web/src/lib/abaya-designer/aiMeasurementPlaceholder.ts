import type { AIMeasurementResult, PhotoCapture } from '@/types/abaya-designer/aiMeasurement';
import { AI_MEASUREMENT_DISCLAIMER } from '@/types/abaya-designer/aiMeasurement';

/**
 * Placeholder for future AI photo-based measurement pipeline.
 *
 * Future integrations (not implemented):
 * - MediaPipe Pose: 2D keypoints → scale with known height
 * - SMPL / SMPL-X: parametric body mesh → circumferences
 * - OpenPose: multi-person keypoint detection
 * - Custom trained regression model on abaya-specific dataset
 */
export async function estimateMeasurementsFromPhotos(
  _captures: PhotoCapture
): Promise<AIMeasurementResult> {
  return {
    captures: _captures,
    estimated: {},
    confidence: 0,
    manualCorrectionRequired: true,
    pipeline: undefined,
    disclaimer: AI_MEASUREMENT_DISCLAIMER,
  };
}

export function isAIMeasurementAvailable(): boolean {
  return false;
}
