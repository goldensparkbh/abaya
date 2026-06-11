import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE from 'three';
import './abaya-designer.css';
import type { AbayaDesignState, AbayaDesignerModuleProps, DesignerStep } from '@/types/abaya-designer/abaya';
import { createInitialDesignState, DEFAULT_FABRIC, DEFAULT_STYLE } from '@/types/abaya-designer/abaya';
import { EMPTY_BODY_MEASUREMENTS } from '@/types/abaya-designer/measurements';
import { calculateGarmentMeasurements } from '@/lib/abaya-designer/fitRules';
import { generatePattern } from '@/lib/abaya-designer/patternGenerator';
import { validateMeasurements } from '@/lib/abaya-designer/measurementValidation';
import MeasurementStep from './MeasurementStep';
import StyleStep from './StyleStep';
import FabricStep from './FabricStep';
import AbayaPreview3D from './AbayaPreview3D';
import DesignerSummary from './DesignerSummary';
import ExportActions from './ExportActions';
import ProductionSheet from './ProductionSheet';

const STEPS: { id: DesignerStep; label: string }[] = [
  { id: 'measurements', label: 'Measurements' },
  { id: 'style', label: 'Style' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'preview', label: 'Preview' },
  { id: 'production', label: 'Production sheet' },
];

function recompute(draft: AbayaDesignState): AbayaDesignState {
  const style = draft.style ?? DEFAULT_STYLE;
  const fabricSel = draft.fabric ?? DEFAULT_FABRIC;
  const garment = calculateGarmentMeasurements(draft.body, draft.fit, style, fabricSel.fabric);
  const pattern = generatePattern(garment, style);
  return { ...draft, style, fabric: fabricSel, garment, pattern };
}

export default function AbayaDesignerModule({
  initialData,
  onDesignChange,
  onSubmitDesign,
  brandColor = '#b8956a',
}: AbayaDesignerModuleProps) {
  const exportRef = useRef<THREE.Group | null>(null);
  const [errors, setErrors] = useState<ReturnType<typeof validateMeasurements>>([]);

  const [design, setDesign] = useState<AbayaDesignState>(() =>
    recompute(
      createInitialDesignState({
        ...initialData,
        body: { ...EMPTY_BODY_MEASUREMENTS, ...initialData?.body },
        customer: {
          name: initialData?.customer?.name ?? '',
          phone: initialData?.customer?.phone ?? '',
          orderReference: initialData?.customer?.orderReference ?? '',
        },
      })
    )
  );

  useEffect(() => {
    onDesignChange?.(design);
  }, [design, onDesignChange]);

  const setStep = (step: DesignerStep) => setDesign((d) => ({ ...d, step }));

  const updateDesign = useCallback((patch: Partial<AbayaDesignState>) => {
    setDesign((d) => recompute({ ...d, ...patch }));
  }, []);

  const stepIndex = STEPS.findIndex((s) => s.id === design.step);

  const goNext = () => {
    if (design.step === 'measurements') {
      const v = validateMeasurements(design.body, design.customer.name);
      setErrors(v);
      if (v.length) return;
    }
    const next = STEPS[Math.min(stepIndex + 1, STEPS.length - 1)];
    setStep(next.id);
  };

  const goBack = () => {
    const prev = STEPS[Math.max(stepIndex - 1, 0)];
    setStep(prev.id);
  };

  const handleSubmit = () => {
    onSubmitDesign?.(design);
  };

  const brandStyle = useMemo(() => ({ ['--ad-brand' as string]: brandColor }), [brandColor]);

  return (
    <div id="abaya-designer-root" className="abaya-designer-module mx-auto max-w-6xl px-4 py-8" style={brandStyle}>
      <header className="mb-8 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ad-gold">Custom abaya</p>
        <h1 className="mt-2 text-3xl font-semibold text-ad-ink md:text-4xl">AI Abaya Designer</h1>
        <p className="mt-2 max-w-2xl text-sm text-ad-muted">
          Enter your measurements, choose style and fabric, preview in 3D, and export a tailor-ready production sheet.
        </p>
      </header>

      <nav className="ad-no-print mb-8 overflow-x-auto">
        <ol className="flex min-w-max gap-2 md:gap-3">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  design.step === s.id
                    ? 'bg-ad-ink text-white shadow-ad'
                    : i <= stepIndex
                      ? 'bg-ad-sand text-ad-ink hover:bg-ad-gold/20'
                      : 'bg-white text-ad-muted border border-ad-line'
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">{i + 1}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-3xl border border-ad-line bg-white p-6 shadow-ad md:p-8">
          {design.step === 'measurements' && (
            <MeasurementStep
              customer={design.customer}
              body={design.body}
              fit={design.fit}
              errors={errors}
              onCustomerChange={(customer) => updateDesign({ customer })}
              onBodyChange={(body) => updateDesign({ body })}
              onFitChange={(fit) => updateDesign({ fit })}
            />
          )}
          {design.step === 'style' && <StyleStep style={design.style} onChange={(style) => updateDesign({ style })} />}
          {design.step === 'fabric' && <FabricStep fabric={design.fabric} onChange={(fabric) => updateDesign({ fabric })} />}
          {design.step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-ad-ink">Preview Abaya</h2>
                <p className="mt-1 text-sm text-ad-muted">Live 3D preview updates with your measurements, fit, style, and fabric.</p>
              </div>
              <AbayaPreview3D design={design} exportRef={exportRef} height={440} />
              <DesignerSummary design={design} />
              <ExportActions design={design} exportRef={exportRef} />
            </div>
          )}
          {design.step === 'production' && <ProductionSheet design={design} />}
        </div>

        <aside className="ad-no-print lg:col-span-2 space-y-4">
          {design.step !== 'preview' && design.step !== 'production' ? (
            <>
              <AbayaPreview3D design={design} height={320} className="sticky top-24" />
              <DesignerSummary design={design} compact />
            </>
          ) : design.step === 'production' ? (
            <div className="rounded-2xl border border-ad-line bg-white p-5 shadow-ad sticky top-24">
              <h3 className="font-semibold text-ad-ink">Recommended garment measurements</h3>
              {design.garment ? (
                <ul className="mt-3 space-y-2 text-sm text-ad-muted">
                  <li>Chest: <strong className="text-ad-ink">{design.garment.chestCircumference} cm</strong></li>
                  <li>Hip: <strong className="text-ad-ink">{design.garment.hipCircumference} cm</strong></li>
                  <li>Length: <strong className="text-ad-ink">{design.garment.garmentLength} cm</strong></li>
                  <li>Fabric: <strong className="text-ad-ink">{design.garment.fabricQuantityMeters} m</strong></li>
                </ul>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>

      <footer className="ad-no-print mt-8 flex flex-col-reverse gap-3 border-t border-ad-line pt-6 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="rounded-full border border-ad-line px-6 py-3 text-sm font-semibold text-ad-ink disabled:opacity-40"
        >
          Back
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          {design.step === 'production' ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full px-8 py-3 text-sm font-semibold text-white shadow-ad"
              style={{ backgroundColor: brandColor }}
            >
              Submit design
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-ad-ink px-8 py-3 text-sm font-semibold text-white hover:bg-ad-ink/90"
            >
              Continue
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

export { AbayaDesignerModule };
export type { AbayaDesignerModuleProps, AbayaDesignState };
