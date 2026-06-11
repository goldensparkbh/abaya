import * as THREE from 'three';
import type { BodyMeasurements } from '@/types/abaya-designer/measurements';
import { buildSmoothProfileRings } from './profileBuilder';
import {
  addShadows,
  buildCurvedPanel,
  buildEllipticalRevolution,
  buildTaperedTube,
  cm,
  radiusFromCircumference,
} from './proceduralGeometry';

export interface LadyBodyDimensions {
  height: number;
  shoulderY: number;
  bustY: number;
  waistY: number;
  hipY: number;
  shoulderHalf: number;
  chestR: number;
  bustR: number;
  bustFrontBoost: number;
  waistR: number;
  hipR: number;
  armLen: number;
  upperArmR: number;
  wristR: number;
  neckR: number;
  headR: number;
}

export function computeLadyBodyDimensions(body: BodyMeasurements): LadyBodyDimensions {
  const height = cm(body.height);
  const chestR = radiusFromCircumference(body.chestCircumference, 0.88);
  const bustR = Math.max(chestR, radiusFromCircumference(body.bustCircumference, 0.9));
  const bustDiff = Math.max(0, body.bustCircumference - body.chestCircumference);
  const bustFrontBoost = 0.78 + Math.min(0.22, bustDiff / 80);

  return {
    height,
    shoulderY: height * 0.818,
    bustY: height * 0.718,
    waistY: height * 0.578,
    hipY: height * 0.518,
    shoulderHalf: cm(body.shoulderWidth / 2),
    chestR,
    bustR,
    bustFrontBoost,
    waistR: radiusFromCircumference(body.waistCircumference, 0.84),
    hipR: radiusFromCircumference(body.hipCircumference, 0.9),
    armLen: cm(body.armLength),
    upperArmR: radiusFromCircumference(body.upperArmCircumference, 0.4),
    wristR: radiusFromCircumference(body.wristCircumference, 0.36),
    neckR: Math.max(0.038, radiusFromCircumference(body.neckCircumference ?? 36, 0.36)),
    headR: Math.max(0.07, radiusFromCircumference(body.neckCircumference ?? 36, 0.48)),
  };
}

function mannequinMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xf0e6dc,
    roughness: 0.42,
    metalness: 0.03,
    sheen: 0.22,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0xfffaf5),
    clearcoat: 0.12,
    clearcoatRoughness: 0.35,
  });
}

function hijabMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x2e2a28,
    roughness: 0.82,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
}

function standMaterial() {
  return new THREE.MeshStandardMaterial({ color: 0xb8b8c0, roughness: 0.28, metalness: 0.78 });
}

/** One continuous smooth body — professional fashion mannequin silhouette. */
function buildMannequinBody(d: LadyBodyDimensions, material: THREE.Material): THREE.Mesh {
  const rings = buildSmoothProfileRings(
    d.shoulderY,
    [
      { t: 0, rx: d.hipR * 0.22, rzScale: 0.55 },
      { t: 0.05, rx: d.hipR * 0.28, rzScale: 0.58 },
      { t: 0.18, rx: d.hipR * 0.38, rzScale: 0.62 },
      { t: 0.32, rx: d.hipR * 0.52, rzScale: 0.68 },
      { t: 0.48, rx: d.hipR, rzScale: 0.74 },
      { t: 0.56, rx: d.waistR, rzScale: 0.7 },
      { t: 0.64, rx: d.chestR * 0.94, rzScale: 0.72 },
      { t: 0.72, rx: d.bustR, rzScale: d.bustFrontBoost },
      { t: 0.8, rx: d.bustR * 0.92, rzScale: 0.74 },
      { t: 0.9, rx: d.shoulderHalf * 0.88, rzScale: 0.62 },
      { t: 1, rx: d.shoulderHalf * 0.72, rzScale: 0.56 },
    ],
    20,
    0.76
  );

  const geo = buildEllipticalRevolution(rings, { radialSegments: 96, capBottom: true });
  geo.computeVertexNormals();
  return addShadows(new THREE.Mesh(geo, material));
}

function buildMannequinArm(side: -1 | 1, d: LadyBodyDimensions, material: THREE.Material): THREE.Group {
  const sign = side;
  const sx = sign * (d.shoulderHalf + d.upperArmR * 0.06);
  const shoulder = new THREE.Vector3(sx, d.shoulderY - 0.02, 0);
  const elbow = new THREE.Vector3(sign * (d.shoulderHalf + d.upperArmR * 0.88), d.shoulderY - d.armLen * 0.36, sign * 0.03);
  const wrist = new THREE.Vector3(sign * (d.shoulderHalf + d.upperArmR * 0.52), d.shoulderY - d.armLen * 0.86, sign * 0.045);

  const arm = new THREE.Group();
  arm.add(addShadows(new THREE.Mesh(buildTaperedTube([shoulder, elbow], d.upperArmR, d.upperArmR * 0.82, 32, 16), material)));
  arm.add(addShadows(new THREE.Mesh(buildTaperedTube([elbow, wrist], d.upperArmR * 0.72, d.wristR * 0.95, 28, 14), material)));

  const hand = addShadows(new THREE.Mesh(new THREE.SphereGeometry(d.wristR * 0.9, 20, 16), material));
  hand.position.copy(wrist);
  hand.position.y -= d.wristR * 0.45;
  hand.scale.set(0.65, 0.48, 0.4);
  arm.add(hand);
  return arm;
}

function buildMannequinHead(d: LadyBodyDimensions, bodyMat: THREE.Material, hijab: THREE.Material): THREE.Group {
  const headGroup = new THREE.Group();
  const neckY = d.shoulderY + d.neckR * 1.45;
  const headY = neckY + d.headR * 1.05;

  const neck = addShadows(
    new THREE.Mesh(
      buildEllipticalRevolution(
        [
          { y: d.shoulderY, rx: d.neckR * 0.9, rz: d.neckR * 0.68 },
          { y: neckY, rx: d.neckR * 0.78, rz: d.neckR * 0.62 },
        ],
        { radialSegments: 32, capTop: true }
      ),
      bodyMat
    )
  );

  const head = addShadows(new THREE.Mesh(new THREE.SphereGeometry(d.headR, 36, 28), bodyMat));
  head.position.y = headY;
  head.scale.set(0.86, 1.05, 0.78);

  const cap = addShadows(
    new THREE.Mesh(
      buildEllipticalRevolution(
        [
          { y: neckY - d.headR * 0.02, rx: d.headR * 1.02, rz: d.headR * 0.9 },
          { y: headY + d.headR * 0.38, rx: d.headR * 1.32, rz: d.headR * 1.12 },
        ],
        { radialSegments: 48, capTop: true }
      ),
      hijab
    )
  );

  const drapeTop: THREE.Vector3[] = [];
  const drapeBottom: THREE.Vector3[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const angle = -0.38 + t * 0.76;
    const r = d.headR * 1.22;
    drapeTop.push(new THREE.Vector3(Math.sin(angle) * r * 0.52, headY - d.headR * 0.06, Math.cos(angle) * r * 0.44 + d.headR * 0.18));
    drapeBottom.push(new THREE.Vector3(Math.sin(angle) * r * 0.92, d.bustY + d.headR * 0.35, Math.cos(angle) * r * 0.52 + d.headR * 0.32));
  }

  headGroup.add(neck, head, cap, addShadows(new THREE.Mesh(buildCurvedPanel(drapeTop, drapeBottom, 12), hijab)));
  return headGroup;
}

function buildStand(d: LadyBodyDimensions): THREE.Group {
  const stand = new THREE.Group();
  const mat = standMaterial();
  stand.add(addShadows(new THREE.Mesh(new THREE.CylinderGeometry(d.hipR * 0.5, d.hipR * 0.58, 0.028, 48), mat)));
  stand.children[0].position.y = 0.014;
  const pole = addShadows(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, d.height * 0.055, 12), mat));
  pole.position.y = d.height * 0.045;
  stand.add(pole);
  return stand;
}

export function buildLadyMannequin(body: BodyMeasurements): THREE.Group {
  const root = new THREE.Group();
  root.name = 'LadyMannequin';

  const d = computeLadyBodyDimensions(body);
  const bodyMat = mannequinMaterial();
  const hijab = hijabMaterial();

  const figure = new THREE.Group();
  figure.rotation.y = -0.06;
  figure.rotation.z = 0.02;
  figure.add(buildStand(d));
  figure.add(buildMannequinBody(d, bodyMat));
  figure.add(buildMannequinArm(-1, d, bodyMat));
  figure.add(buildMannequinArm(1, d, bodyMat));
  figure.add(buildMannequinHead(d, bodyMat, hijab));

  root.add(figure);
  root.rotation.y = 0.08;
  return root;
}

export function getMannequinShoulderY(body: BodyMeasurements): number {
  return computeLadyBodyDimensions(body).shoulderY;
}

export function getMannequinHeadY(body: BodyMeasurements): number {
  const d = computeLadyBodyDimensions(body);
  return d.shoulderY + d.neckR * 1.45 + d.headR * 1.05;
}
