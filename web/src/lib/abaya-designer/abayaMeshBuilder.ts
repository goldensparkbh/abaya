import * as THREE from 'three';
import type { FitType, GarmentMeasurements, StyleSelections } from '@/types/abaya-designer/abaya';
import type { FabricSelections } from '@/types/abaya-designer/abaya';
import type { BodyMeasurements } from '@/types/abaya-designer/measurements';
import { materialPropsFromFabric } from './fabricRules';
import { buildLadyMannequin, computeLadyBodyDimensions } from './mannequinBuilder';
import { buildSmoothProfileRings, fitVolumeScale } from './profileBuilder';
import {
  attachClothWind,
  buildHemEdgeBand,
  createEdgeMaterial,
  meshLocalBounds,
  type WindEntry,
} from './clothEffects';
import {
  CM,
  addShadows,
  buildCurvedPanel,
  buildEllipticalRevolution,
  buildTaperedTube,
  radiusFromCircumference,
} from './proceduralGeometry';

function createAbayaMaterial(fabric: FabricSelections): THREE.MeshPhysicalMaterial {
  const props = materialPropsFromFabric(fabric.fabric, fabric.colorHex);
  const color = new THREE.Color(props.color);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  const emissiveBoost = hsl.l < 0.25 ? 0.06 + (0.25 - hsl.l) * 0.25 : 0.02;

  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: color.clone().multiplyScalar(emissiveBoost),
    roughness: props.roughness,
    metalness: props.metalness,
    sheen: Math.min(1, props.sheen + 0.08),
    sheenRoughness: 0.42,
    clearcoat: props.clearcoat,
    side: THREE.DoubleSide,
  });
}

function styleFlare(style: StyleSelections): number {
  if (style.abayaStyle === 'butterfly') return 1.32;
  if (style.abayaStyle === 'kimono') return 1.18;
  if (style.abayaStyle === 'open_front') return 1.06;
  return 1;
}

function depthRatioForStyle(style: StyleSelections): number {
  if (style.abayaStyle === 'kimono') return 0.86;
  if (style.abayaStyle === 'butterfly') return 0.84;
  return 0.86;
}

function buildAbayaBodyShell(
  garment: GarmentMeasurements,
  style: StyleSelections,
  fabric: FabricSelections,
  body: BodyMeasurements,
  fit: FitType,
  windRegistry: WindEntry[]
): THREE.Mesh {
  const mat = createAbayaMaterial(fabric);
  const d = computeLadyBodyDimensions(body);
  const flare = styleFlare(style) * fitVolumeScale(fit);
  const depth = depthRatioForStyle(style);
  const shoulderAttach = d.shoulderY - 0.02;

  const hemR = radiusFromCircumference(garment.hemWidth, 0.5) * flare;
  const hipR = radiusFromCircumference(garment.hipCircumference, 0.48) * flare;
  const waistR = radiusFromCircumference(garment.waistCircumference, 0.46) * flare;
  const bustR = radiusFromCircumference(garment.bustCircumference, 0.48) * flare;
  const chestR = radiusFromCircumference(garment.chestCircumference, 0.46) * flare;
  const shoulderHalf = (garment.shoulderWidth / 2) * CM * flare;
  const bustFront = 0.84 + Math.min(0.18, (garment.bustCircumference - garment.chestCircumference) / 120);

  const rings = buildSmoothProfileRings(
    shoulderAttach,
    [
      { t: 0, rx: hemR, rzScale: depth },
      { t: 0.12, rx: hemR * 0.98, rzScale: depth },
      { t: 0.28, rx: hipR, rzScale: depth * 0.98 },
      { t: 0.46, rx: waistR, rzScale: depth * 0.96 },
      { t: 0.58, rx: chestR, rzScale: depth * 0.94 },
      { t: 0.68, rx: bustR, rzScale: bustFront },
      { t: 0.8, rx: bustR * 0.96, rzScale: depth * 0.96 },
      { t: 0.92, rx: shoulderHalf * 0.94, rzScale: depth * 0.92 },
      { t: 1, rx: shoulderHalf * 0.78, rzScale: depth * 0.88 },
    ],
    22,
    depth
  );

  const geo = buildEllipticalRevolution(rings, { radialSegments: 96, capBottom: true });
  geo.computeVertexNormals();

  const bodyMesh = addShadows(new THREE.Mesh(geo, mat));
  const bounds = meshLocalBounds(bodyMesh);
  attachClothWind(mat, { hemY: bounds.min.y, topY: bounds.max.y, strength: 0.016 }, windRegistry);
  return bodyMesh;
}

function buildAbayaSleeves(
  garment: GarmentMeasurements,
  style: StyleSelections,
  fabric: FabricSelections,
  body: BodyMeasurements,
  fit: FitType,
  windRegistry: WindEntry[]
): THREE.Group {
  const sleeves = new THREE.Group();
  const baseMat = createAbayaMaterial(fabric);
  const d = computeLadyBodyDimensions(body);
  const flare = fitVolumeScale(fit);
  const sleeveLen = garment.sleeveLength * CM * 0.82;
  const topR = radiusFromCircumference(garment.sleeveOpening, style.sleeveStyle === 'wide' ? 0.54 : 0.48) * flare;
  const botR =
    style.sleeveStyle === 'flared' ? topR * 1.35 : style.sleeveStyle === 'cuffed' ? topR * 0.86 : topR * 1.04;
  const attachY = d.shoulderY - 0.04;

  [-1, 1].forEach((sign) => {
    const side = sign as -1 | 1;
    const sx = side * (d.shoulderHalf + topR * 0.22);
    const shoulder = new THREE.Vector3(sx, attachY, 0.04);
    const elbow = new THREE.Vector3(side * (d.shoulderHalf + topR * 0.95), attachY - sleeveLen * 0.42, side * 0.05);
    const wrist = new THREE.Vector3(side * (d.shoulderHalf + topR * 0.58), attachY - sleeveLen * 0.88, side * 0.06);

    const sleeveMat = baseMat.clone();
    const sleeve = addShadows(
      new THREE.Mesh(buildTaperedTube([shoulder, elbow, wrist], topR, botR, 36, 20), sleeveMat)
    );
    const sb = meshLocalBounds(sleeve);
    attachClothWind(sleeveMat, { hemY: sb.min.y, topY: sb.max.y, strength: 0.01 }, windRegistry);
    sleeves.add(sleeve);
  });

  return sleeves;
}

function buildClothEdges(
  garment: GarmentMeasurements,
  style: StyleSelections,
  fabric: FabricSelections,
  fit: FitType
): THREE.Group {
  const edges = new THREE.Group();
  edges.name = 'ClothEdges';
  const mat = createAbayaMaterial(fabric);
  const edgeMat = createEdgeMaterial(mat);
  const flare = styleFlare(style) * fitVolumeScale(fit);
  const depth = depthRatioForStyle(style);
  const hemR = radiusFromCircumference(garment.hemWidth, 0.5) * flare;

  edges.add(buildHemEdgeBand(0, hemR, hemR * depth, edgeMat));
  return edges;
}

function buildStyleAccents(
  garment: GarmentMeasurements,
  style: StyleSelections,
  fabric: FabricSelections,
  body: BodyMeasurements,
  fit: FitType
): THREE.Group {
  const accents = new THREE.Group();
  const mat = createAbayaMaterial(fabric);
  const d = computeLadyBodyDimensions(body);
  const shoulderAttach = d.shoulderY - 0.02;
  const flare = styleFlare(style) * fitVolumeScale(fit);
  const hemR = radiusFromCircumference(garment.hemWidth, 0.5) * flare;
  const depth = depthRatioForStyle(style);

  const collar = addShadows(
    new THREE.Mesh(
      new THREE.TorusGeometry(radiusFromCircumference(garment.bustCircumference, 0.46) * 0.62, 0.007, 8, 64),
      createEdgeMaterial(mat)
    )
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = shoulderAttach * 0.98;
  collar.scale.set(1, depth, 1);
  accents.add(collar);

  if (style.abayaStyle === 'open_front') {
    [-1, 1].forEach((sign) => {
      accents.add(
        addShadows(
          new THREE.Mesh(
            buildCurvedPanel(
              [
                new THREE.Vector3(sign * hemR * 0.1, shoulderAttach * 0.86, hemR * depth * 0.42),
                new THREE.Vector3(sign * hemR * 0.24, shoulderAttach * 0.5, hemR * depth * 0.52),
                new THREE.Vector3(sign * hemR * 0.3, shoulderAttach * 0.14, hemR * depth * 0.48),
              ],
              [
                new THREE.Vector3(sign * hemR * 0.44, shoulderAttach * 0.82, hemR * depth * 0.56),
                new THREE.Vector3(sign * hemR * 0.56, shoulderAttach * 0.46, hemR * depth * 0.62),
                new THREE.Vector3(sign * hemR * 0.58, shoulderAttach * 0.08, hemR * depth * 0.58),
              ],
              12
            ),
            mat.clone()
          )
        )
      );
    });
  }

  if (style.abayaStyle === 'butterfly') {
    const wingMat = mat.clone();
    wingMat.transparent = true;
    wingMat.opacity = 0.94;
    [-1, 1].forEach((sign) => {
      accents.add(
        addShadows(
          new THREE.Mesh(
            buildCurvedPanel(
              [
                new THREE.Vector3(sign * hemR * 0.52, shoulderAttach * 0.66, 0.05),
                new THREE.Vector3(sign * hemR * 0.88, shoulderAttach * 0.48, sign * 0.08),
                new THREE.Vector3(sign * hemR * 0.96, shoulderAttach * 0.34, sign * 0.1),
              ],
              [
                new THREE.Vector3(sign * hemR * 0.58, shoulderAttach * 0.44, 0.04),
                new THREE.Vector3(sign * hemR * 0.82, shoulderAttach * 0.32, sign * 0.06),
                new THREE.Vector3(sign * hemR * 0.86, shoulderAttach * 0.24, sign * 0.08),
              ],
              12
            ),
            wingMat
          )
        )
      );
    });
  }

  return accents;
}

export function buildAbayaMeshGroup(
  garment: GarmentMeasurements,
  style: StyleSelections,
  fabric: FabricSelections,
  body?: BodyMeasurements,
  fit: FitType = 'normal',
  windRegistry: WindEntry[] = []
): THREE.Group {
  const g = new THREE.Group();
  g.name = 'AbayaGarment';
  if (!body) return g;

  g.add(buildAbayaBodyShell(garment, style, fabric, body, fit, windRegistry));
  g.add(buildAbayaSleeves(garment, style, fabric, body, fit, windRegistry));
  g.add(buildClothEdges(garment, style, fabric, fit));
  g.add(buildStyleAccents(garment, style, fabric, body, fit));

  return g;
}

function centerOnFloor(group: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(group);
  group.position.x -= (box.min.x + box.max.x) / 2;
  group.position.z -= (box.min.z + box.max.z) / 2;
  group.position.y -= box.min.y;
}

export interface WornAbayaSceneResult {
  scene: THREE.Group;
  windRegistry: WindEntry[];
}

export function buildWornAbayaScene(
  body: BodyMeasurements,
  garment: GarmentMeasurements,
  style: StyleSelections,
  fabric: FabricSelections,
  fit: FitType = 'normal'
): THREE.Group {
  return buildWornAbayaSceneWithWind(body, garment, style, fabric, fit).scene;
}

export function buildWornAbayaSceneWithWind(
  body: BodyMeasurements,
  garment: GarmentMeasurements,
  style: StyleSelections,
  fabric: FabricSelections,
  fit: FitType = 'normal'
): WornAbayaSceneResult {
  const scene = new THREE.Group();
  scene.name = 'AbayaDesignWorn';
  const windRegistry: WindEntry[] = [];

  scene.add(buildLadyMannequin(body));
  const abaya = buildAbayaMeshGroup(garment, style, fabric, body, fit, windRegistry);
  abaya.position.z = 0.055;

  scene.add(abaya);
  centerOnFloor(scene);
  scene.userData.windRegistry = windRegistry;
  return { scene, windRegistry };
}
