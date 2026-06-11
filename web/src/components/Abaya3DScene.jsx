import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { hexForColor } from './abayaModel.js';

const SCALE = 0.013;

const DEFAULT_ABAYA_URL = '/models/abaya.glb';
const DEFAULT_MANNEQUIN_URL = '/models/mannequin.glb';

/* -------------------------------------------------------------------------- */
/* Procedural geometry helpers                                                */
/* -------------------------------------------------------------------------- */

function makeBodyGeometry(sizes) {
  const length = sizes.length * SCALE;
  const points = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2((sizes.hip / 4) * SCALE * 1.18, 0),
    new THREE.Vector2((sizes.hip / 4) * SCALE * 1.05, length * 0.12),
    new THREE.Vector2((sizes.hip / 4) * SCALE, length * 0.3),
    new THREE.Vector2((sizes.waist / 4) * SCALE * 1.02, length * 0.45),
    new THREE.Vector2((sizes.waist / 4) * SCALE, length * 0.52),
    new THREE.Vector2((sizes.bust / 4) * SCALE, length * 0.7),
    new THREE.Vector2((sizes.bust / 4) * SCALE * 0.82, length * 0.79),
    new THREE.Vector2((sizes.shoulder / 2) * SCALE * 0.62, length * 0.87),
    new THREE.Vector2((sizes.shoulder / 2) * SCALE * 0.55, length * 0.92),
    new THREE.Vector2((sizes.neck / 5) * SCALE, length * 0.965),
    new THREE.Vector2((sizes.neck / 6) * SCALE, length),
  ];
  return new THREE.LatheGeometry(points, 64);
}

function makeSleeveGeometry(sizes) {
  const sleeveLen = sizes.sleeve * SCALE;
  const topRadius = (sizes.armhole / 5.2) * SCALE;
  const bottomRadius = topRadius * 1.08;
  return new THREE.CylinderGeometry(topRadius, bottomRadius, sleeveLen, 28, 1, true);
}

function makeShoulderCap(sizes) {
  const r = (sizes.shoulder / 2) * SCALE * 0.62;
  return new THREE.SphereGeometry(r, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2.4);
}

function positionSleeves({ leftSleeve, rightSleeve, sizes }) {
  const length = sizes.length * SCALE;
  const sleeveLen = sizes.sleeve * SCALE;
  const shoulderHalf = (sizes.shoulder / 2) * SCALE;
  const topRadius = (sizes.armhole / 5.2) * SCALE;
  const shoulderY = length * 0.86;
  const angle = 0.16;
  const offsetX = shoulderHalf + topRadius * 0.55;
  const offsetY = shoulderY - sleeveLen / 2;
  leftSleeve.position.set(-offsetX, offsetY, 0);
  leftSleeve.rotation.z = angle;
  rightSleeve.position.set(offsetX, offsetY, 0);
  rightSleeve.rotation.z = -angle;
}

function positionShoulderCaps({ leftCap, rightCap, sizes }) {
  const length = sizes.length * SCALE;
  const shoulderHalf = (sizes.shoulder / 2) * SCALE;
  const shoulderY = length * 0.88;
  leftCap.position.set(-shoulderHalf * 0.62, shoulderY, 0);
  leftCap.rotation.set(0, 0, -0.05);
  rightCap.position.set(shoulderHalf * 0.62, shoulderY, 0);
  rightCap.rotation.set(0, 0, 0.05);
}

/* -------------------------------------------------------------------------- */
/* Materials                                                                  */
/* -------------------------------------------------------------------------- */

function materialPropsForFabric(fabric, colorObj) {
  const base = {
    color: colorObj,
    side: THREE.DoubleSide,
    metalness: 0,
    roughness: 0.7,
    sheen: 0,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.5,
    transmission: 0,
    thickness: 0,
    ior: 1.4,
    transparent: false,
    opacity: 1,
    clearcoat: 0,
    clearcoatRoughness: 0.5,
  };
  switch (fabric) {
    case 'Silk':
      return {
        ...base,
        roughness: 0.3,
        sheen: 1.0,
        sheenRoughness: 0.35,
        sheenColor: colorObj.clone().lerp(new THREE.Color(0xffffff), 0.5),
        clearcoat: 0.18,
        clearcoatRoughness: 0.45,
      };
    case 'Chiffon':
      return { ...base, roughness: 0.55, transmission: 0.22, thickness: 0.6, opacity: 0.92, transparent: true };
    case 'Linen':
      return { ...base, roughness: 0.92 };
    case 'Cotton':
      return { ...base, roughness: 0.82 };
    case 'Crepe':
      return { ...base, roughness: 0.74 };
    case 'Nida':
      return { ...base, roughness: 0.55, clearcoat: 0.08, clearcoatRoughness: 0.6 };
    default:
      return base;
  }
}

function applyTintAndFabric(materials, colorHex, fabric) {
  const colorObj = new THREE.Color(colorHex);
  const props = materialPropsForFabric(fabric, colorObj);
  for (const m of materials) {
    if (!m) continue;
    if (m.color && m.color.set) m.color.set(colorObj);
    if ('roughness' in m && props.roughness != null) m.roughness = props.roughness;
    if ('metalness' in m && props.metalness != null) m.metalness = props.metalness;
    if ('sheen' in m) m.sheen = props.sheen || 0;
    if ('sheenColor' in m && m.sheenColor?.set && props.sheenColor) m.sheenColor.set(props.sheenColor);
    if ('sheenRoughness' in m) m.sheenRoughness = props.sheenRoughness ?? 0.5;
    if ('transmission' in m) m.transmission = props.transmission || 0;
    if ('thickness' in m) m.thickness = props.thickness || 0;
    if ('clearcoat' in m) m.clearcoat = props.clearcoat || 0;
    if ('clearcoatRoughness' in m) m.clearcoatRoughness = props.clearcoatRoughness ?? 0.5;
    if (typeof m.transparent === 'boolean') m.transparent = !!props.transparent;
    if (typeof m.opacity === 'number') m.opacity = props.opacity ?? 1;
    m.needsUpdate = true;
  }
}

/* -------------------------------------------------------------------------- */
/* Wind shader (vertex displacement, lower-half only)                         */
/* -------------------------------------------------------------------------- */

const WIND_CHUNK_COMMON = /* glsl */ `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uHemY;
  uniform float uTopY;
`;

const WIND_CHUNK_VERTEX = /* glsl */ `
  float windRange = max(0.001, uTopY - uHemY);
  float windNorm = clamp((uTopY - position.y) / windRange, 0.0, 1.0);
  float windWeight = smoothstep(0.0, 1.0, windNorm) * smoothstep(0.0, 0.65, windNorm);
  float t = uTime;
  float waveX = sin(t * 1.3 + position.y * 4.0 + position.z * 2.0);
  float waveZ = cos(t * 1.05 + position.x * 3.0 + position.y * 2.7);
  float gust = sin(t * 0.5) * 0.5 + 0.55;
  transformed.x += windWeight * waveX * uWindStrength * gust;
  transformed.z += windWeight * waveZ * uWindStrength * gust * 0.85;
  transformed.y += windWeight * (waveX + waveZ) * uWindStrength * 0.06;
`;

function attachWind(material, { hemY, topY, strength = 0.05 }, registry) {
  if (!material) return;
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader) => {
    if (typeof prev === 'function') prev(shader);
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uWindStrength = { value: strength };
    shader.uniforms.uHemY = { value: hemY };
    shader.uniforms.uTopY = { value: topY };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WIND_CHUNK_COMMON}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${WIND_CHUNK_VERTEX}`);
    material.userData.windShader = shader;
    registry.push({ material, shader });
  };
  material.needsUpdate = true;
}

function meshBoundsLocal(mesh) {
  mesh.geometry.computeBoundingBox();
  const bb = mesh.geometry.boundingBox || new THREE.Box3();
  return { min: bb.min.clone(), max: bb.max.clone() };
}

/* -------------------------------------------------------------------------- */
/* Stage decorations                                                          */
/* -------------------------------------------------------------------------- */

function buildContactShadow() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.4, 'rgba(0,0,0,0.28)');
  grad.addColorStop(1, 'rgba(0,0,0,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const geom = new THREE.PlaneGeometry(3, 1.4);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.001;
  return mesh;
}

function buildPodium() {
  const geom = new THREE.CylinderGeometry(1.6, 1.85, 0.06, 64, 1, false);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: 0.55, metalness: 0.22 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = -0.03;
  mesh.receiveShadow = true;
  return mesh;
}

function buildFloorRing() {
  const geom = new THREE.RingGeometry(1.6, 4, 64);
  const mat = new THREE.MeshBasicMaterial({ color: 0x07070a, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(geom, mat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.03;
  return ring;
}

function buildBackdropGradient() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size * 0.35, 30, size / 2, size * 0.7, size);
  grad.addColorStop(0, '#2a2932');
  grad.addColorStop(0.45, '#15141a');
  grad.addColorStop(1, '#050507');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/* -------------------------------------------------------------------------- */
/* Procedural garment builder                                                 */
/* -------------------------------------------------------------------------- */

function buildProceduralGarment({ sizes, fabric, colorHex, windRegistry, wind = true }) {
  const colorObj = new THREE.Color(colorHex);
  const baseProps = materialPropsForFabric(fabric, colorObj);

  const bodyMat = new THREE.MeshPhysicalMaterial(baseProps);
  const sleeveMat = new THREE.MeshPhysicalMaterial(baseProps);
  const capMat = new THREE.MeshPhysicalMaterial(baseProps);

  const body = new THREE.Mesh(makeBodyGeometry(sizes), bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  body.scale.set(1, 1, 0.7);

  const leftSleeve = new THREE.Mesh(makeSleeveGeometry(sizes), sleeveMat);
  const rightSleeve = new THREE.Mesh(makeSleeveGeometry(sizes), sleeveMat);
  leftSleeve.scale.set(1, 1, 0.85);
  rightSleeve.scale.set(1, 1, 0.85);
  leftSleeve.castShadow = true;
  rightSleeve.castShadow = true;
  positionSleeves({ leftSleeve, rightSleeve, sizes });

  const leftCap = new THREE.Mesh(makeShoulderCap(sizes), capMat);
  const rightCap = new THREE.Mesh(makeShoulderCap(sizes), capMat);
  leftCap.scale.set(1, 0.5, 0.7);
  rightCap.scale.set(1, 0.5, 0.7);
  positionShoulderCaps({ leftCap, rightCap, sizes });

  if (wind) {
    const bodyBounds = meshBoundsLocal(body);
    attachWind(bodyMat, { hemY: bodyBounds.min.y, topY: bodyBounds.max.y, strength: 0.05 }, windRegistry);

    const sleeveBounds = meshBoundsLocal(leftSleeve);
    attachWind(sleeveMat, { hemY: sleeveBounds.min.y, topY: sleeveBounds.max.y, strength: 0.025 }, windRegistry);

    const capBounds = meshBoundsLocal(leftCap);
    attachWind(capMat, { hemY: capBounds.min.y, topY: capBounds.max.y, strength: 0.008 }, windRegistry);
  }

  const group = new THREE.Group();
  group.add(body, leftSleeve, rightSleeve, leftCap, rightCap);
  group.userData = { bodyMat, sleeveMat, capMat, body, leftSleeve, rightSleeve, leftCap, rightCap };
  return group;
}

/* -------------------------------------------------------------------------- */
/* Glb fit + traversal                                                        */
/* -------------------------------------------------------------------------- */

function fitObjectToHeight(obj, targetHeight) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  if (!size.y || !isFinite(size.y)) return 1;
  const scale = targetHeight / size.y;
  obj.scale.setScalar(scale);
  // After scaling, recompute box to place feet on the floor
  const box2 = new THREE.Box3().setFromObject(obj);
  obj.position.y -= box2.min.y;
  return scale;
}

function collectMaterials(obj) {
  const mats = [];
  obj.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const m = node.material;
    if (Array.isArray(m)) m.forEach((mm) => mats.push(mm));
    else if (m) mats.push(m);
  });
  return mats;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Abaya3DScene({
  color = 'Black',
  colorHex,
  fabric = 'Crepe',
  sizes,
  autoRotate = false,
  wind = true,
  showMannequin = true,
  abayaModelUrl = DEFAULT_ABAYA_URL,
  mannequinModelUrl = DEFAULT_MANNEQUIN_URL,
  height = 520,
  className = '',
}) {
  const wrapRef = useRef(null);
  const refs = useRef({});
  const propsRef = useRef({ color, colorHex, fabric, sizes, autoRotate, wind });
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState({ loadingAbaya: true, loadingMannequin: true, hasImportedAbaya: false, hasMannequin: false });

  propsRef.current = { color, colorHex, fabric, sizes, autoRotate, wind };

  /* ---------- Setup once ---------- */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setSupported(false);
      return undefined;
    }

    const w = wrap.clientWidth || 360;
    const h = wrap.clientHeight || height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = buildBackdropGradient();
    scene.fog = new THREE.Fog(0x101015, 6, 18);

    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 1.55, 4.8);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.4;
    controls.maxDistance = 7.5;
    controls.minPolarAngle = Math.PI / 3.6;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.autoRotateSpeed = 0.45;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.18);
    const hemi = new THREE.HemisphereLight(0xfff0d8, 0x33334a, 0.45);
    const key = new THREE.DirectionalLight(0xfff1d6, 2.2);
    key.position.set(2.2, 4.5, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    key.shadow.camera.left = -2.5;
    key.shadow.camera.right = 2.5;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -1;
    const rim = new THREE.DirectionalLight(0xa0b8ff, 1.4);
    rim.position.set(-2.6, 3, -2.6);
    const fill = new THREE.PointLight(0xfff3dd, 0.7, 8, 1.4);
    fill.position.set(0, 1.8, 3.2);
    const spot = new THREE.SpotLight(0xfff0d0, 1.4, 8, Math.PI / 6, 0.6, 1);
    spot.position.set(0, 5.5, 1.8);
    spot.target.position.set(0, 1.2, 0);
    scene.add(ambient, hemi, key, rim, fill, spot, spot.target);

    // Set / podium
    const podium = buildPodium();
    const floor = buildFloorRing();
    const shadow = buildContactShadow();
    scene.add(podium, floor, shadow);

    // Garments root group
    const garmentRoot = new THREE.Group();
    scene.add(garmentRoot);

    // Wind shader registry across procedural + imported materials
    const windRegistry = [];

    // Procedural garment (always built; hidden later if GLB succeeds)
    const initial = propsRef.current;
    const initialHex = initial.colorHex || hexForColor(initial.color);
    const procedural = buildProceduralGarment({
      sizes: initial.sizes,
      fabric: initial.fabric,
      colorHex: initialHex,
      windRegistry,
      wind: initial.wind,
    });
    garmentRoot.add(procedural);

    refs.current = {
      renderer, scene, camera, controls,
      podium, floor, shadow, garmentRoot,
      procedural, proceduralVisible: true,
      imported: null, importedMaterials: [],
      mannequin: null, mixer: null,
      windRegistry,
      mounted: true,
    };

    // ---- Animation loop ----
    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const dt = clock.getDelta();
      const elapsed = clock.elapsedTime;

      controls.autoRotate = propsRef.current.autoRotate;
      controls.update();

      if (refs.current.mixer) refs.current.mixer.update(dt);

      const windOn = propsRef.current.wind !== false;
      for (const entry of refs.current.windRegistry) {
        if (entry.shader?.uniforms?.uTime) entry.shader.uniforms.uTime.value = windOn ? elapsed : 0;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    // ---- Resize ----
    const ro = new ResizeObserver(() => {
      const nw = wrap.clientWidth;
      const nh = wrap.clientHeight;
      if (!nw || !nh) return;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(wrap);

    // ---- Load optional GLBs ----
    const loader = new GLTFLoader();

    const tryLoadAbaya = (url) => {
      if (!url) {
        setStatus((s) => ({ ...s, loadingAbaya: false }));
        return;
      }
      loader.load(
        url,
        (gltf) => {
          if (!refs.current.mounted) return;
          const obj = gltf.scene || gltf.scenes?.[0];
          if (!obj) {
            setStatus((s) => ({ ...s, loadingAbaya: false }));
            return;
          }
          fitObjectToHeight(obj, 1.65);
          const materials = collectMaterials(obj);
          // Attach wind to imported materials with their own bounds
          obj.traverse((node) => {
            if (!node.isMesh) return;
            const bounds = meshBoundsLocal(node);
            const ms = Array.isArray(node.material) ? node.material : [node.material];
            ms.forEach((m) => attachWind(m, { hemY: bounds.min.y, topY: bounds.max.y, strength: 0.03 }, refs.current.windRegistry));
          });
          // Apply current color/fabric
          const p = propsRef.current;
          applyTintAndFabric(materials, p.colorHex || hexForColor(p.color), p.fabric);
          garmentRoot.add(obj);
          // Hide procedural now that real one is in
          refs.current.procedural.visible = false;
          refs.current.proceduralVisible = false;
          refs.current.imported = obj;
          refs.current.importedMaterials = materials;
          setStatus((s) => ({ ...s, loadingAbaya: false, hasImportedAbaya: true }));
        },
        undefined,
        () => {
          // Missing file is expected during local dev — keep procedural model.
          setStatus((s) => ({ ...s, loadingAbaya: false, hasImportedAbaya: false }));
        }
      );
    };

    const tryLoadMannequin = (url) => {
      if (!url) {
        setStatus((s) => ({ ...s, loadingMannequin: false }));
        return;
      }
      loader.load(
        url,
        (gltf) => {
          if (!refs.current.mounted) return;
          const obj = gltf.scene || gltf.scenes?.[0];
          if (!obj) {
            setStatus((s) => ({ ...s, loadingMannequin: false }));
            return;
          }
          fitObjectToHeight(obj, 1.72);
          // Mannequin: dark matte silhouette so it reads as a stand-in
          obj.traverse((node) => {
            if (!node.isMesh) return;
            node.castShadow = true;
            node.receiveShadow = true;
            const replace = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.72, metalness: 0.12 });
            if (Array.isArray(node.material)) node.material = node.material.map(() => replace);
            else node.material = replace;
          });
          // Add a hair-pulled-back hijab feel: nothing extra. Just keep skin dark.
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(obj);
            const clip = gltf.animations.find((c) => /walk|idle/i.test(c.name)) || gltf.animations[0];
            const action = mixer.clipAction(clip);
            action.play();
            refs.current.mixer = mixer;
          }
          scene.add(obj);
          refs.current.mannequin = obj;
          obj.visible = propsRef.current.showMannequin !== false;
          setStatus((s) => ({ ...s, loadingMannequin: false, hasMannequin: true }));
        },
        undefined,
        () => {
          setStatus((s) => ({ ...s, loadingMannequin: false, hasMannequin: false }));
        }
      );
    };

    tryLoadAbaya(abayaModelUrl);
    tryLoadMannequin(mannequinModelUrl);

    // ---- Cleanup ----
    return () => {
      refs.current.mounted = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      // Dispose procedural geometries + materials
      const p = refs.current.procedural?.userData;
      if (p) {
        p.body.geometry.dispose();
        p.leftSleeve.geometry.dispose();
        p.rightSleeve.geometry.dispose();
        p.leftCap.geometry.dispose();
        p.rightCap.geometry.dispose();
        p.bodyMat.dispose();
        p.sleeveMat.dispose();
        p.capMat.dispose();
      }
      if (refs.current.imported) {
        refs.current.imported.traverse((node) => {
          if (node.isMesh) {
            node.geometry?.dispose?.();
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach((m) => m?.dispose?.());
          }
        });
      }
      if (refs.current.mannequin) {
        refs.current.mannequin.traverse((node) => {
          if (node.isMesh) {
            node.geometry?.dispose?.();
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach((m) => m?.dispose?.());
          }
        });
      }
      shadow.material.map?.dispose();
      shadow.material.dispose();
      shadow.geometry.dispose();
      podium.material.dispose();
      podium.geometry.dispose();
      floor.material.dispose();
      floor.geometry.dispose();
      scene.background?.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentNode === wrap) wrap.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Reactive: sizes ---------- */
  useEffect(() => {
    const r = refs.current;
    if (!sizes) return;
    if (r.procedural?.visible) {
      const u = r.procedural.userData;
      u.body.geometry.dispose();
      u.body.geometry = makeBodyGeometry(sizes);
      u.leftSleeve.geometry.dispose();
      u.leftSleeve.geometry = makeSleeveGeometry(sizes);
      u.rightSleeve.geometry.dispose();
      u.rightSleeve.geometry = makeSleeveGeometry(sizes);
      u.leftCap.geometry.dispose();
      u.leftCap.geometry = makeShoulderCap(sizes);
      u.rightCap.geometry.dispose();
      u.rightCap.geometry = makeShoulderCap(sizes);
      positionSleeves({ leftSleeve: u.leftSleeve, rightSleeve: u.rightSleeve, sizes });
      positionShoulderCaps({ leftCap: u.leftCap, rightCap: u.rightCap, sizes });
      // Update wind bounds on body (its hem/top changed with length)
      const bb = meshBoundsLocal(u.body);
      if (u.bodyMat.userData.windShader) {
        u.bodyMat.userData.windShader.uniforms.uHemY.value = bb.min.y;
        u.bodyMat.userData.windShader.uniforms.uTopY.value = bb.max.y;
      }
      const sbb = meshBoundsLocal(u.leftSleeve);
      if (u.sleeveMat.userData.windShader) {
        u.sleeveMat.userData.windShader.uniforms.uHemY.value = sbb.min.y;
        u.sleeveMat.userData.windShader.uniforms.uTopY.value = sbb.max.y;
      }
    }
    if (r.imported) {
      // Loose proxy: scale group with length / hip ratios so sliders still feel responsive.
      const defaults = { length: 145, hip: 95, bust: 90 };
      const yk = Math.max(0.78, Math.min(1.22, sizes.length / defaults.length));
      const xk = Math.max(0.85, Math.min(1.18, (sizes.hip + sizes.bust) / (defaults.hip + defaults.bust)));
      r.imported.scale.set(r.imported.scale.x * xk / (r.imported.userData.xk || 1), r.imported.scale.y * yk / (r.imported.userData.yk || 1), r.imported.scale.z * xk / (r.imported.userData.xk || 1));
      r.imported.userData.xk = xk;
      r.imported.userData.yk = yk;
    }
    const sliderLen = (sizes.length || 145) * SCALE;
    r.controls?.target?.set(0, sliderLen * 0.5, 0);
  }, [sizes]);

  /* ---------- Reactive: color + fabric ---------- */
  useEffect(() => {
    const r = refs.current;
    const hex = colorHex || hexForColor(color);
    if (r.procedural?.userData) {
      const u = r.procedural.userData;
      applyTintAndFabric([u.bodyMat, u.sleeveMat, u.capMat], hex, fabric);
    }
    if (r.importedMaterials?.length) {
      applyTintAndFabric(r.importedMaterials, hex, fabric);
    }
  }, [color, colorHex, fabric]);

  /* ---------- Reactive: mannequin visibility ---------- */
  useEffect(() => {
    const r = refs.current;
    if (r.mannequin) r.mannequin.visible = !!showMannequin;
  }, [showMannequin]);

  return (
    <div ref={wrapRef} className={`abaya-3d ${className}`} style={{ height }}>
      {!supported ? (
        <div className="abaya-3d__fallback">Your browser does not support WebGL.</div>
      ) : null}
      {status.loadingAbaya || status.loadingMannequin ? (
        <div className="abaya-3d__loading">
          <div className="cine-spinner cine-spinner--sm" aria-hidden="true"><div /><div /><div /></div>
        </div>
      ) : null}
      <div className="abaya-3d__badges">
        {status.hasImportedAbaya ? <span className="abaya-3d__badge">GLB</span> : <span className="abaya-3d__badge abaya-3d__badge--muted">Parametric</span>}
        {status.hasMannequin ? <span className="abaya-3d__badge">Mixamo</span> : null}
      </div>
    </div>
  );
}
