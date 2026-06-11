import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export interface ExportMetadata {
  customerName?: string;
  fit?: string;
  fabric?: string;
  color?: string;
  generatedAt?: string;
}

export function exportSceneToGlb(
  object: THREE.Object3D,
  filename = 'abaya-design.glb',
  metadata?: ExportMetadata
): Promise<void> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (result) => {
        try {
          const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          if (metadata) {
            console.info('[AbayaDesigner] GLB exported', metadata);
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

export function cloneSceneForExport(source: THREE.Object3D): THREE.Object3D {
  const clone = source.clone(true);
  clone.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      const mesh = node as THREE.Mesh;
      if (mesh.geometry) mesh.geometry = mesh.geometry.clone();
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mesh.material = mats.length === 1 ? mats[0].clone() : mats.map((m) => m.clone());
      }
    }
  });
  return clone;
}
