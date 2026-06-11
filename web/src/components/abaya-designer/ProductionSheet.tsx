import type { AbayaDesignState } from '@/types/abaya-designer/abaya';
import { getFitLabel } from '@/lib/abaya-designer/fitRules';
import { patternToCutList } from '@/lib/abaya-designer/patternGenerator';
import {
  ABAYA_STYLES,
  CLOSURES,
  EMBROIDERY_OPTIONS,
  NECKLINES,
  SLEEVE_STYLES,
} from '@/data/abaya-designer/styles';

function lbl<T extends { id: string; label: string }>(arr: T[], id: string) {
  return arr.find((x) => x.id === id)?.label ?? id;
}

interface ProductionSheetProps {
  design: AbayaDesignState;
}

export default function ProductionSheet({ design }: ProductionSheetProps) {
  const { customer, body, garment, pattern, style, fabric, fit } = design;
  if (!garment || !pattern) {
    return <p className="text-ad-muted">Complete previous steps to generate the production sheet.</p>;
  }

  const cutList = patternToCutList(pattern);
  const tailorNotes = garment.tailorNotes.join('\n');

  const onPrint = () => window.print();
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(tailorNotes);
      alert('Tailor notes copied.');
    } catch {
      alert('Could not copy — select text manually.');
    }
  };

  return (
    <div className="production-sheet space-y-6">
      <div className="ad-no-print flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPrint}
          className="rounded-full border border-ad-line bg-white px-5 py-2.5 text-sm font-semibold hover:border-ad-gold"
        >
          Print production sheet
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full border border-ad-line bg-white px-5 py-2.5 text-sm font-semibold hover:border-ad-gold"
        >
          Copy tailor notes
        </button>
      </div>

      <header className="border-b border-ad-line pb-4">
        <h2 className="text-2xl font-semibold text-ad-ink">Tailor Production Sheet</h2>
        <p className="text-sm text-ad-muted">Recommended garment measurements · pattern dimensions · QC checklist</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ad-line bg-white p-4">
          <h3 className="font-semibold text-ad-ink">Customer</h3>
          <ul className="mt-2 space-y-1 text-sm text-ad-muted">
            <li>Name: <strong className="text-ad-ink">{customer.name}</strong></li>
            {customer.phone ? <li>Phone: {customer.phone}</li> : null}
            {customer.orderReference ? <li>Ref: {customer.orderReference}</li> : null}
          </ul>
        </div>
        <div className="rounded-xl border border-ad-line bg-white p-4">
          <h3 className="font-semibold text-ad-ink">Design selections</h3>
          <ul className="mt-2 space-y-1 text-sm text-ad-muted">
            <li>Fit: <strong className="text-ad-ink">{getFitLabel(fit)}</strong></li>
            <li>Style: {lbl(ABAYA_STYLES, style.abayaStyle)}</li>
            <li>Sleeves: {lbl(SLEEVE_STYLES, style.sleeveStyle)}</li>
            <li>Neckline: {lbl(NECKLINES, style.neckline)}</li>
            <li>Closure: {lbl(CLOSURES, style.closure)}</li>
            <li>Embroidery: {lbl(EMBROIDERY_OPTIONS, style.embroidery)}</li>
            <li>Fabric: {fabric.fabric} · {fabric.color}</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-ad-line bg-white p-4">
          <h3 className="font-semibold text-ad-ink">Body measurements (cm)</h3>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(body).map(([k, v]) =>
              v != null ? (
                <div key={k} className="flex justify-between border-b border-ad-line/50 py-1">
                  <dt className="text-ad-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ) : null
            )}
          </dl>
        </div>
        <div className="rounded-xl border border-ad-line bg-ad-sand/30 p-4">
          <h3 className="font-semibold text-ad-ink">Recommended garment measurements (cm)</h3>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {[
              ['Chest', garment.chestCircumference],
              ['Bust', garment.bustCircumference],
              ['Waist', garment.waistCircumference],
              ['Hip', garment.hipCircumference],
              ['Shoulder', garment.shoulderWidth],
              ['Sleeve length', garment.sleeveLength],
              ['Sleeve opening', garment.sleeveOpening],
              ['Garment length', garment.garmentLength],
              ['Hem width', garment.hemWidth],
              ['Front panel', garment.frontPanelWidth],
              ['Back panel', garment.backPanelWidth],
              ['Fabric qty', `${garment.fabricQuantityMeters} m`],
              ['Seam allowance', `${garment.seamAllowanceCm} cm`],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between border-b border-ad-line/50 py-1">
                <dt className="text-ad-muted">{k}</dt>
                <dd className="font-semibold text-ad-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-ad-line bg-white p-4">
        <h3 className="font-semibold text-ad-ink">Pattern dimensions</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ad-line text-ad-muted">
              <th className="py-2">Panel</th>
              <th className="py-2">Width (cm)</th>
              <th className="py-2">Length (cm)</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {cutList.map((row) => (
              <tr key={row.name} className="border-b border-ad-line/50">
                <td className="py-2 font-medium">{row.name}</td>
                <td className="py-2">{row.w}</td>
                <td className="py-2">{row.h}</td>
                <td className="py-2 text-ad-muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-ad-muted">
          Neckline: {pattern.neckline.style} · opening {pattern.neckline.openingWidthCm} cm · depth{' '}
          {pattern.neckline.depthCm} cm · Hem allowance {pattern.hemAllowanceCm} cm
        </p>
      </section>

      <section className="rounded-xl border border-ad-line bg-white p-4">
        <h3 className="font-semibold text-ad-ink">Tailor notes</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ad-muted">
          {garment.tailorNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
          {pattern.cuttingNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-ad-line bg-white p-4">
        <h3 className="font-semibold text-ad-ink">Quality control checklist</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {pattern.qualityChecklist.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-ad-line" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
