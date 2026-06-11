import type { EllipseRing } from './proceduralGeometry';

interface ProfileKey {
  t: number;
  rx: number;
  rzScale?: number;
}

/** Smoothly interpolate measurement-driven body/garment profiles (no jagged vertex noise). */
export function buildSmoothProfileRings(
  height: number,
  keys: ProfileKey[],
  segments = 16,
  depthRatio = 0.8
): EllipseRing[] {
  const sorted = [...keys].sort((a, b) => a.t - b.t);
  const rings: EllipseRing[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * height;

    let k0 = sorted[0];
    let k1 = sorted[sorted.length - 1];
    for (let j = 0; j < sorted.length - 1; j++) {
      if (t >= sorted[j].t && t <= sorted[j + 1].t) {
        k0 = sorted[j];
        k1 = sorted[j + 1];
        break;
      }
    }

    const localT = k1.t === k0.t ? 0 : (t - k0.t) / (k1.t - k0.t);
    const ease = localT * localT * (3 - 2 * localT);
    const rx = k0.rx + (k1.rx - k0.rx) * ease;
    const rz0 = k0.rx * (k0.rzScale ?? depthRatio);
    const rz1 = k1.rx * (k1.rzScale ?? depthRatio);
    const rz = rz0 + (rz1 - rz0) * ease;

    rings.push({ y, rx, rz });
  }

  return rings;
}

export function fitVolumeScale(fit: 'normal' | 'loose' | 'very_loose'): number {
  if (fit === 'loose') return 1.06;
  if (fit === 'very_loose') return 1.14;
  return 1;
}
