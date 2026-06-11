import type { BodyMeasurements, CustomerInfo } from '@/types/abaya-designer/measurements';
import type { FitType } from '@/types/abaya-designer/abaya';
import { FIT_OPTIONS } from '@/data/abaya-designer/styles';
import { fieldError, validateMeasurements } from '@/lib/abaya-designer/measurementValidation';
import type { MeasurementValidationError } from '@/types/abaya-designer/measurements';

interface MeasurementStepProps {
  customer: CustomerInfo;
  body: BodyMeasurements;
  fit: FitType;
  onCustomerChange: (c: CustomerInfo) => void;
  onBodyChange: (b: BodyMeasurements) => void;
  onFitChange: (f: FitType) => void;
  errors: MeasurementValidationError[];
}

const FIELDS: { key: keyof BodyMeasurements; label: string; optional?: boolean }[] = [
  { key: 'height', label: 'Height (cm)' },
  { key: 'shoulderWidth', label: 'Shoulder width (cm)' },
  { key: 'chestCircumference', label: 'Chest / under bust (cm)' },
  { key: 'bustCircumference', label: 'Bust — fullest part (cm)' },
  { key: 'waistCircumference', label: 'Waist circumference (cm)' },
  { key: 'hipCircumference', label: 'Hip circumference (cm)' },
  { key: 'armLength', label: 'Arm length (cm)' },
  { key: 'upperArmCircumference', label: 'Upper arm circumference (cm)' },
  { key: 'wristCircumference', label: 'Wrist circumference (cm)' },
  { key: 'desiredAbayaLength', label: 'Desired abaya length (cm)' },
  { key: 'neckCircumference', label: 'Neck circumference (cm)', optional: true },
];

function Field({
  label,
  value,
  onChange,
  error,
  optional,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  error?: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ad-ink">
        {label}
        {optional ? <span className="text-ad-muted"> (optional)</span> : null}
      </span>
      <input
        type="number"
        step="0.5"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
          error ? 'border-red-400 focus:ring-red-200' : 'border-ad-line focus:border-ad-gold focus:ring-ad-gold/20'
        }`}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export default function MeasurementStep({
  customer,
  body,
  fit,
  onCustomerChange,
  onBodyChange,
  onFitChange,
  errors,
}: MeasurementStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-ad-ink">Body measurements</h2>
        <p className="mt-1 text-sm text-ad-muted">Enter measurements in centimeters. We apply modest-fit ease automatically.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block sm:col-span-2 lg:col-span-1">
          <span className="mb-1 block text-sm font-medium text-ad-ink">Customer name</span>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
            className="w-full rounded-xl border border-ad-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ad-gold focus:ring-2 focus:ring-ad-gold/20"
          />
          {fieldError(errors, 'customer.name') ? (
            <span className="mt-1 block text-xs text-red-600">{fieldError(errors, 'customer.name')}</span>
          ) : null}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ad-ink">Phone (optional)</span>
          <input
            type="tel"
            value={customer.phone ?? ''}
            onChange={(e) => onCustomerChange({ ...customer, phone: e.target.value })}
            className="w-full rounded-xl border border-ad-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ad-gold focus:ring-2 focus:ring-ad-gold/20"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ad-ink">Order reference (optional)</span>
          <input
            type="text"
            value={customer.orderReference ?? ''}
            onChange={(e) => onCustomerChange({ ...customer, orderReference: e.target.value })}
            className="w-full rounded-xl border border-ad-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ad-gold focus:ring-2 focus:ring-ad-gold/20"
          />
        </label>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ad-muted">Fit preference</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {FIT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onFitChange(opt.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                fit === opt.id
                  ? 'border-ad-gold bg-ad-sand shadow-ad ring-1 ring-ad-gold/30'
                  : 'border-ad-line bg-white hover:border-ad-gold/50'
              }`}
            >
              <span className="block font-semibold text-ad-ink">{opt.label}</span>
              <span className="mt-1 block text-xs text-ad-muted">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map(({ key, label, optional }) => (
          <Field
            key={key}
            label={label}
            optional={optional}
            value={body[key]}
            onChange={(v) => onBodyChange({ ...body, [key]: v })}
            error={fieldError(errors, key)}
          />
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-ad-line bg-ad-sand/50 p-4 text-sm text-ad-muted">
        <strong className="text-ad-ink">Future:</strong> AI photo measurement (MediaPipe / SMPL) will auto-fill these fields — not available in this MVP.
      </div>
    </div>
  );
}

export { validateMeasurements };
