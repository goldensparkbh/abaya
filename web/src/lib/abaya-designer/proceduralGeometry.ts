import * as THREE from 'three';

/** Centimeters → Three.js scene units (1 cm ≈ 0.012 units). */
export const CM = 0.012;

export function cm(value: number): number {
  return value * CM;
}

/** Circumference (cm) → elliptical radius in scene units. */
export function radiusFromCircumference(circumferenceCm: number, scale = 1): number {
  return Math.max(0.018, (circumferenceCm / (2 * Math.PI)) * CM * scale);
}

export interface EllipseRing {
  /** Height from floor (scene units). */
  y: number;
  /** Half-width on X axis. */
  rx: number;
  /** Half-depth on Z axis; defaults to rx * depthRatio when omitted. */
  rz?: number;
}

export interface RevolutionOptions {
  radialSegments?: number;
  depthRatio?: number;
  phiStart?: number;
  phiLength?: number;
  capTop?: boolean;
  capBottom?: boolean;
}

/**
 * Revolve an elliptical profile around Y to produce a smooth torso / garment shell.
 */
export function buildEllipticalRevolution(
  rings: EllipseRing[],
  options: RevolutionOptions = {}
): THREE.BufferGeometry {
  const {
    radialSegments = 56,
    depthRatio = 0.76,
    phiStart = 0,
    phiLength = Math.PI * 2,
    capTop = false,
    capBottom = false,
  } = options;

  if (rings.length < 2) {
    return new THREE.BufferGeometry();
  }

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const ringCount = rings.length;
  const segCount = radialSegments + 1;

  for (let i = 0; i < ringCount; i++) {
    const ring = rings[i];
    const rz = ring.rz ?? ring.rx * depthRatio;
    const v = i / (ringCount - 1);

    for (let j = 0; j <= radialSegments; j++) {
      const u = j / radialSegments;
      const angle = phiStart + u * phiLength;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      vertices.push(cos * ring.rx, ring.y, sin * rz);
      uvs.push(u, v);
    }
  }

  const stride = segCount;
  for (let i = 0; i < ringCount - 1; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  if (capBottom) {
    const centerIndex = vertices.length / 3;
    vertices.push(0, rings[0].y, 0);
    uvs.push(0.5, 0);
    for (let j = 0; j < radialSegments; j++) {
      indices.push(centerIndex, j + 1, j);
    }
  }

  if (capTop) {
    const top = rings[ringCount - 1];
    const centerIndex = vertices.length / 3;
    vertices.push(0, top.y, 0);
    uvs.push(0.5, 1);
    const base = (ringCount - 1) * stride;
    for (let j = 0; j < radialSegments; j++) {
      indices.push(centerIndex, base + j, base + j + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export interface TubeAlongCurveOptions {
  tubularSegments?: number;
  radialSegments?: number;
  radiusStart?: number;
  radiusEnd?: number;
  closed?: boolean;
}

/** Smooth limb / sleeve tube along a 3D curve. */
export function buildTubeAlongCurve(
  curve: THREE.Curve<THREE.Vector3>,
  options: TubeAlongCurveOptions = {}
): THREE.BufferGeometry {
  const {
    tubularSegments = 32,
    radialSegments = 16,
    radiusStart = 0.04,
    radiusEnd = 0.03,
    closed = false,
  } = options;

  return new THREE.TubeGeometry(
    curve,
    tubularSegments,
    radiusStart,
    radialSegments,
    closed,
    radiusEnd !== radiusStart
      ? undefined
      : undefined
  );
}

/** Tapered tube with custom start/end radii via scaled TubeGeometry. */
export function buildTaperedTube(
  points: THREE.Vector3[],
  radiusStart: number,
  radiusEnd: number,
  tubularSegments = 28,
  radialSegments = 14
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, t);
    const P = curve.getPoint(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const angle = v * Math.PI * 2;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const normal = new THREE.Vector3()
        .copy(N)
        .multiplyScalar(cos * radius)
        .addScaledVector(B, sin * radius);
      vertices.push(P.x + normal.x, P.y + normal.y, P.z + normal.z);
      normals.push(normal.x / radius, normal.y / radius, normal.z / radius);
      uvs.push(v, t);
    }
  }

  const stride = radialSegments + 1;
  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

/** Subtle fabric fold displacement on lower garment panels. */
export function applyFabricFolds(
  geometry: THREE.BufferGeometry,
  garmentLength: number,
  intensity = 1
): void {
  const pos = geometry.getAttribute('position');
  if (!pos || garmentLength <= 0) return;

  const tmp = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    const t = THREE.MathUtils.clamp(tmp.y / garmentLength, 0, 1);
    if (t > 0.5) continue;

    const depth = (0.5 - t) * intensity;
    const waveX = Math.sin(tmp.x * 38 + t * 14) * 0.012 * depth;
    const waveZ = Math.cos(tmp.z * 42 + t * 9) * 0.008 * depth;
    const hem = Math.sin(t * Math.PI * 3.5) * 0.006 * intensity;
    pos.setXYZ(i, tmp.x + waveX, tmp.y, tmp.z + waveZ + hem);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

/** Push the front torso outward using full-bust vs chest difference. */
export function applyBustContour(
  geometry: THREE.BufferGeometry,
  bustY: number,
  span: number,
  frontDepth: number
): void {
  const pos = geometry.getAttribute('position');
  if (!pos || frontDepth <= 0) return;

  const tmp = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    const yDist = Math.abs(tmp.y - bustY);
    if (yDist > span) continue;

    const yWeight = 1 - yDist / span;
    const angle = Math.atan2(tmp.z, tmp.x);
    const frontWeight = (Math.cos(angle) + 1) * 0.5;
    const sideWeight = Math.pow(Math.sin(angle), 2) * 0.35;
    const push = frontDepth * yWeight * yWeight * (frontWeight + sideWeight);
    const len = Math.sqrt(tmp.x * tmp.x + tmp.z * tmp.z) || 0.001;
    pos.setXYZ(i, tmp.x + (tmp.x / len) * push * 0.35, tmp.y, tmp.z + (tmp.z / len) * push);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

/** Curved hijab / panel strip between two splines. */
export function buildCurvedPanel(
  top: THREE.Vector3[],
  bottom: THREE.Vector3[],
  widthSegments = 12
): THREE.BufferGeometry {
  const rows = Math.min(top.length, bottom.length);
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j <= widthSegments; j++) {
      const u = j / widthSegments;
      const a = top[i];
      const b = bottom[i];
      vertices.push(
        THREE.MathUtils.lerp(a.x, b.x, u),
        THREE.MathUtils.lerp(a.y, b.y, u),
        THREE.MathUtils.lerp(a.z, b.z, u)
      );
      uvs.push(u, i / (rows - 1));
    }
  }

  const stride = widthSegments + 1;
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < widthSegments; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function addShadows(mesh: THREE.Mesh): THREE.Mesh {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
