import * as THREE from 'three';

export interface WindEntry {
  material: THREE.MeshPhysicalMaterial;
  shader: { uniforms: Record<string, { value: number }> };
}

const WIND_COMMON = /* glsl */ `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uHemY;
  uniform float uTopY;
`;

const WIND_VERTEX = /* glsl */ `
  float windRange = max(0.001, uTopY - uHemY);
  float windNorm = clamp((uTopY - position.y) / windRange, 0.0, 1.0);
  float windWeight = smoothstep(0.0, 1.0, windNorm) * smoothstep(0.08, 0.55, windNorm);
  float t = uTime * 0.85;
  float waveX = sin(t * 0.9 + position.y * 2.8 + position.z * 1.4);
  float waveZ = cos(t * 0.75 + position.x * 2.2 + position.y * 2.0);
  float gust = sin(t * 0.35) * 0.25 + 0.75;
  transformed.x += windWeight * waveX * uWindStrength * gust;
  transformed.z += windWeight * waveZ * uWindStrength * gust * 0.75;
  transformed.y += windWeight * sin(t + position.x) * uWindStrength * 0.018;
`;

const FABRIC_COMMON = /* glsl */ `
  uniform float uHemY;
  uniform float uTopY;
`;

const FABRIC_FRAGMENT = /* glsl */ `
  float hemRange = max(0.001, uTopY - uHemY);
  float hemNorm = clamp((vViewPosition.y - uHemY) / hemRange, 0.0, 1.0);
  float hemEdge = (1.0 - smoothstep(0.0, 0.08, hemNorm)) * 0.12;
  float sideEdge = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.5) * 0.06;
  float weave = sin(vViewPosition.x * 120.0 + vViewPosition.y * 80.0) * 0.015;
  outgoingLight += (hemEdge + sideEdge + weave) * diffuseColor.rgb;
`;

export function attachClothWind(
  material: THREE.MeshPhysicalMaterial,
  bounds: { hemY: number; topY: number; strength?: number },
  registry: WindEntry[]
): void {
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader) => {
    if (typeof prev === 'function') prev(shader);
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uWindStrength = { value: bounds.strength ?? 0.016 };
    shader.uniforms.uHemY = { value: bounds.hemY };
    shader.uniforms.uTopY = { value: bounds.topY };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${WIND_COMMON}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${WIND_VERTEX}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FABRIC_COMMON}`)
      .replace(
        '#include <lights_fragment_begin>',
        `#include <lights_fragment_begin>\n${FABRIC_FRAGMENT}`
      );
    material.userData.windShader = shader;
    registry.push({ material, shader });
  };
  material.needsUpdate = true;
}

export function tickClothWind(registry: WindEntry[], elapsed: number, enabled = true): void {
  const t = enabled ? elapsed : 0;
  for (const entry of registry) {
    if (entry.shader?.uniforms?.uTime) {
      entry.shader.uniforms.uTime.value = t;
    }
  }
}

export function createEdgeMaterial(base: THREE.MeshPhysicalMaterial): THREE.MeshPhysicalMaterial {
  const edge = base.clone();
  const hsl = { h: 0, s: 0, l: 0 };
  edge.color.getHSL(hsl);
  edge.color.setHSL(hsl.h, hsl.s * 0.9, Math.min(1, hsl.l + 0.06));
  edge.roughness = Math.max(0.2, edge.roughness - 0.08);
  edge.sheen = Math.min(1, (edge.sheen ?? 0) + 0.12);
  return edge;
}

export function buildHemEdgeBand(
  hemY: number,
  radiusX: number,
  radiusZ: number,
  material: THREE.Material
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radiusX * 0.995, 0.008, 6, 96), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.scale.set(1, radiusZ / radiusX, 1);
  mesh.position.y = hemY + 0.006;
  mesh.receiveShadow = true;
  return mesh;
}

export function meshLocalBounds(mesh: THREE.Mesh): { min: THREE.Vector3; max: THREE.Vector3 } {
  mesh.geometry.computeBoundingBox();
  const bb = mesh.geometry.boundingBox ?? new THREE.Box3();
  return { min: bb.min.clone(), max: bb.max.clone() };
}
