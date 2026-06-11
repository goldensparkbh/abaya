import type { FabricSelections } from '@/types/abaya-designer/abaya';
import type { FabricType } from '@/types/abaya-designer/abaya';
import { COLOR_SWATCHES, FABRICS } from '@/data/abaya-designer/fabrics';
import { getFabricRules } from '@/lib/abaya-designer/fabricRules';

interface FabricStepProps {
  fabric: FabricSelections;
  onChange: (f: FabricSelections) => void;
}

export default function FabricStep({ fabric, onChange }: FabricStepProps) {
  const rules = getFabricRules(fabric.fabric);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-ad-ink">Fabric & color</h2>
        <p className="mt-1 text-sm text-ad-muted">Fabric affects drape, production notes, and the 3D preview material.</p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ad-muted">Fabric</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FABRICS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange({ ...fabric, fabric: f.id as FabricType })}
              className={`rounded-2xl border p-4 text-left transition ${
                fabric.fabric === f.id
                  ? 'border-ad-gold bg-ad-sand ring-1 ring-ad-gold/30'
                  : 'border-ad-line bg-white hover:border-ad-gold/50'
              }`}
            >
              <span className="block font-semibold text-ad-ink">{f.label}</span>
              <span className="mt-1 block text-xs text-ad-muted">{f.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ad-muted">Color</h3>
        <div className="flex flex-wrap gap-3">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => onChange({ ...fabric, color: c.name, colorHex: c.hex })}
              className={`flex flex-col items-center gap-2 rounded-xl p-2 transition ${
                fabric.color === c.name ? 'ring-2 ring-ad-gold ring-offset-2' : ''
              }`}
            >
              <span
                className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                style={{ background: c.hex }}
              />
              <span className="text-xs font-medium text-ad-muted">{c.name}</span>
            </button>
          ))}
        </div>
        {fabric.color === 'Custom' ? (
          <label className="mt-4 inline-flex items-center gap-3 rounded-xl bg-ad-sand px-3 py-2">
            <span className="text-sm text-ad-muted">Custom</span>
            <input
              type="color"
              value={fabric.colorHex}
              onChange={(e) => onChange({ ...fabric, colorHex: e.target.value })}
              className="h-10 w-10 cursor-pointer border-0 bg-transparent"
            />
            <code className="text-sm font-semibold text-ad-ink">{fabric.colorHex.toUpperCase()}</code>
          </label>
        ) : null}
      </div>

      <div className="rounded-xl border border-ad-line bg-white p-4 text-sm">
        <p className="font-medium text-ad-ink">Production note</p>
        <p className="mt-1 text-ad-muted">{rules.productionNote}</p>
        <p className="mt-2 text-ad-muted">
          Drape: <strong>{rules.drape}</strong> · Silhouette softness: {Math.round(rules.silhouetteSoftness * 100)}%
        </p>
      </div>
    </div>
  );
}
