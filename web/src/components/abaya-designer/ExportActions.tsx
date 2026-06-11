import { useCallback, useState } from 'react';
import type * as THREE from 'three';
import type { AbayaDesignState } from '@/types/abaya-designer/abaya';
import { buildWornAbayaScene } from '@/lib/abaya-designer/abayaMeshBuilder';
import { exportSceneToGlb } from '@/lib/abaya-designer/glbExporter';
import { getFitLabel } from '@/lib/abaya-designer/fitRules';

interface ExportActionsProps {
  design: AbayaDesignState;
  exportRef?: React.MutableRefObject<THREE.Group | null>;
}

export default function ExportActions({ design, exportRef }: ExportActionsProps) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const onExportGlb = useCallback(async () => {
    if (!design.garment) return;
    setBusy(true);
    setMsg('');
    try {
      let root: THREE.Object3D;
      if (exportRef?.current) {
        root = exportRef.current.clone(true);
      } else {
        root = buildWornAbayaScene(design.body, design.garment!, design.style, design.fabric, design.fit);
      }
      const safeName = (design.customer.name || 'abaya').replace(/\s+/g, '-').toLowerCase();
      await exportSceneToGlb(root, `${safeName}-design.glb`, {
        customerName: design.customer.name,
        fit: getFitLabel(design.fit),
        fabric: design.fabric.fabric,
        color: design.fabric.color,
        generatedAt: new Date().toISOString(),
      });
      setMsg('GLB downloaded successfully.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  }, [design, exportRef]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        disabled={busy || !design.garment}
        onClick={onExportGlb}
        className="inline-flex items-center justify-center rounded-full bg-ad-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ad-ink/90 disabled:opacity-50"
      >
        {busy ? 'Exporting…' : 'Export 3D Model (.glb)'}
      </button>
      {msg ? <span className="text-sm text-ad-muted">{msg}</span> : null}
    </div>
  );
}
