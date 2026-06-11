import type { AbayaDesignState } from '@/types/abaya-designer/abaya';
import { getFitLabel } from '@/lib/abaya-designer/fitRules';
import {
  ABAYA_STYLES,
  CLOSURES,
  EMBROIDERY_OPTIONS,
  LENGTH_PREFERENCES,
  NECKLINES,
  SLEEVE_STYLES,
} from '@/data/abaya-designer/styles';

interface DesignerSummaryProps {
  design: AbayaDesignState;
  compact?: boolean;
}

function label<T extends { id: string; label: string }>(options: T[], id: string) {
  return options.find((o) => o.id === id)?.label ?? id;
}

export default function DesignerSummary({ design, compact = false }: DesignerSummaryProps) {
  const g = design.garment;
  if (!g) return null;

  const rows: [string, string][] = [
    ['Fit', getFitLabel(design.fit)],
    ['Style', label(ABAYA_STYLES, design.style.abayaStyle)],
    ['Sleeves', label(SLEEVE_STYLES, design.style.sleeveStyle)],
    ['Neckline', label(NECKLINES, design.style.neckline)],
    ['Closure', label(CLOSURES, design.style.closure)],
    ['Embroidery', label(EMBROIDERY_OPTIONS, design.style.embroidery)],
    ['Length', label(LENGTH_PREFERENCES, design.style.lengthPreference)],
    ['Fabric', design.fabric.fabric],
    ['Color', `${design.fabric.color} (${design.fabric.colorHex})`],
    ['Garment length', `${g.garmentLength} cm`],
    ['Garment chest', `${g.chestCircumference} cm`],
    ['Garment bust', `${g.bustCircumference} cm`],
    ['Fabric qty', `${g.fabricQuantityMeters} m`],
  ];

  return (
    <div className={`rounded-2xl border border-ad-line bg-ad-sand/40 ${compact ? 'p-4' : 'p-5'}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ad-muted">Design summary</h3>
      <dl className={`mt-3 grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 border-b border-ad-line/60 pb-2 text-sm last:border-0">
            <dt className="text-ad-muted">{k}</dt>
            <dd className="font-medium text-ad-ink text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
