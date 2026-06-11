import type { StyleSelections } from '@/types/abaya-designer/abaya';
import {
  ABAYA_STYLES,
  CLOSURES,
  EMBROIDERY_OPTIONS,
  LENGTH_PREFERENCES,
  NECKLINES,
  SLEEVE_STYLES,
} from '@/data/abaya-designer/styles';

interface StyleStepProps {
  style: StyleSelections;
  onChange: (s: StyleSelections) => void;
}

function OptionGrid<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: { id: T; label: string }[];
  value: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ad-muted">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              value === opt.id
                ? 'border-ad-gold bg-ad-gold text-white shadow-sm'
                : 'border-ad-line bg-white text-ad-ink hover:border-ad-gold/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function StyleStep({ style, onChange }: StyleStepProps) {
  const set = <K extends keyof StyleSelections>(key: K, val: StyleSelections[K]) =>
    onChange({ ...style, [key]: val });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-ad-ink">Abaya style</h2>
        <p className="mt-1 text-sm text-ad-muted">Choose silhouette, sleeves, neckline, and finishing details.</p>
      </div>

      <OptionGrid title="Abaya style" options={ABAYA_STYLES} value={style.abayaStyle} onSelect={(v) => set('abayaStyle', v)} />
      <OptionGrid title="Sleeve style" options={SLEEVE_STYLES} value={style.sleeveStyle} onSelect={(v) => set('sleeveStyle', v)} />
      <OptionGrid title="Neckline" options={NECKLINES} value={style.neckline} onSelect={(v) => set('neckline', v)} />
      <OptionGrid title="Closure" options={CLOSURES} value={style.closure} onSelect={(v) => set('closure', v)} />
      <OptionGrid title="Embroidery" options={EMBROIDERY_OPTIONS} value={style.embroidery} onSelect={(v) => set('embroidery', v)} />
      <OptionGrid
        title="Length preference"
        options={LENGTH_PREFERENCES}
        value={style.lengthPreference}
        onSelect={(v) => set('lengthPreference', v)}
      />
    </div>
  );
}
