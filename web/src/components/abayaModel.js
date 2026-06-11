export const SIZE_KEYS = ['shoulder', 'bust', 'waist', 'hip', 'length', 'sleeve', 'armhole', 'neck'];

export const SIZE_RANGES = {
  shoulder: { min: 30, max: 55, default: 40, step: 0.5 },
  bust: { min: 70, max: 130, default: 90, step: 0.5 },
  waist: { min: 60, max: 120, default: 75, step: 0.5 },
  hip: { min: 75, max: 140, default: 95, step: 0.5 },
  length: { min: 110, max: 180, default: 145, step: 0.5 },
  sleeve: { min: 45, max: 75, default: 60, step: 0.5 },
  armhole: { min: 32, max: 55, default: 42, step: 0.5 },
  neck: { min: 28, max: 50, default: 36, step: 0.5 },
};

export function defaultSizes() {
  return Object.fromEntries(SIZE_KEYS.map((k) => [k, SIZE_RANGES[k].default]));
}

export const COLOR_OPTIONS = [
  { key: 'Black', hex: '#1c1c1e' },
  { key: 'Charcoal Gray', hex: '#3b3f44' },
  { key: 'Dark Olive', hex: '#4d563a' },
  { key: 'Navy', hex: '#1f2a44' },
  { key: 'Stone Beige', hex: '#b8a994' },
  { key: 'Plum', hex: '#5a2d3b' },
  { key: 'Custom', hex: '#7a5a8a' },
];

export function hexForColor(key, customHex) {
  if (key === 'Custom') return customHex || '#7a5a8a';
  const found = COLOR_OPTIONS.find((c) => c.key === key);
  return found ? found.hex : '#1c1c1e';
}

export const FABRIC_OPTIONS = ['Crepe', 'Chiffon', 'Nida', 'Linen', 'Silk', 'Cotton', 'Other'];

/**
 * Build the SVG path data string for the abaya silhouette
 * based on measurement values in centimeters.
 */
export function buildAbayaPath(sizes) {
  const v = (k) => Number(sizes?.[k] ?? SIZE_RANGES[k].default);
  const PX = 2.5;
  const CX = 200;

  const shoulderHalf = (v('shoulder') / 2) * PX;
  const bustHalf = (v('bust') / 4) * PX + 4;
  const waistHalf = (v('waist') / 4) * PX + 2;
  const hipHalf = (v('hip') / 4) * PX + 4;
  const hemHalf = hipHalf + 20;
  const neckHalf = (v('neck') / 5) * PX;
  const armholeDepth = (v('armhole') / 4) * PX;
  const sleeveLen = v('sleeve') * PX;
  const total = v('length') * PX;

  const yTop = 80;
  const yShoulder = yTop + 20;
  const yUnderarm = yShoulder + armholeDepth;
  const yBust = Math.max(yUnderarm + 18, yShoulder + 40);
  const yBottom = yShoulder + total;
  const yWaist = yShoulder + total * 0.42;
  const yHip = yShoulder + total * 0.6;

  const sleeveOuterX = CX - shoulderHalf - 6;
  const sleeveBottomX = CX - shoulderHalf - 12;
  const sleeveCuffY = yShoulder + sleeveLen;

  const d = [
    `M ${CX - neckHalf} ${yTop}`,
    `C ${CX - shoulderHalf * 0.75} ${yTop - 4} ${CX - shoulderHalf * 0.95} ${yShoulder - 4} ${CX - shoulderHalf} ${yShoulder}`,
    `L ${sleeveOuterX} ${yShoulder + sleeveLen * 0.5}`,
    `Q ${sleeveBottomX - 4} ${sleeveCuffY + 4} ${sleeveBottomX} ${sleeveCuffY}`,
    `L ${sleeveBottomX + 16} ${sleeveCuffY + 2}`,
    `Q ${sleeveBottomX + 22} ${sleeveCuffY - 6} ${CX - shoulderHalf + 6} ${yUnderarm + sleeveLen * 0.32}`,
    `L ${CX - shoulderHalf + 6} ${yUnderarm}`,
    `Q ${CX - bustHalf - 4} ${yUnderarm + 8} ${CX - bustHalf} ${yBust}`,
    `Q ${CX - waistHalf - 6} ${(yBust + yWaist) / 2} ${CX - waistHalf} ${yWaist}`,
    `Q ${CX - hipHalf - 6} ${(yWaist + yHip) / 2} ${CX - hipHalf} ${yHip}`,
    `L ${CX - hemHalf} ${yBottom}`,
    `Q ${CX} ${yBottom + 14} ${CX + hemHalf} ${yBottom}`,
    `L ${CX + hipHalf} ${yHip}`,
    `Q ${CX + waistHalf + 6} ${(yWaist + yHip) / 2} ${CX + waistHalf} ${yWaist}`,
    `Q ${CX + bustHalf + 6} ${(yBust + yWaist) / 2} ${CX + bustHalf} ${yBust}`,
    `Q ${CX + bustHalf + 4} ${yUnderarm + 8} ${CX + shoulderHalf - 6} ${yUnderarm}`,
    `L ${CX + shoulderHalf - 6} ${yUnderarm + sleeveLen * 0.32}`,
    `Q ${CX + shoulderHalf + 22 - 16} ${sleeveCuffY - 6} ${CX + shoulderHalf + 12 - 16 + 4} ${sleeveCuffY + 2}`,
    `L ${CX + shoulderHalf + 12} ${sleeveCuffY}`,
    `Q ${CX + shoulderHalf + 12 - 4} ${sleeveCuffY + 4} ${CX + shoulderHalf + 6} ${yShoulder + sleeveLen * 0.5}`,
    `L ${CX + shoulderHalf} ${yShoulder}`,
    `C ${CX + shoulderHalf * 0.95} ${yShoulder - 4} ${CX + shoulderHalf * 0.75} ${yTop - 4} ${CX + neckHalf} ${yTop}`,
    `Q ${CX} ${yTop + neckHalf * 0.7} ${CX - neckHalf} ${yTop}`,
    'Z',
  ].join(' ');

  return {
    path: d,
    bounds: {
      yTop,
      yShoulder,
      yUnderarm,
      yBust,
      yWaist,
      yHip,
      yBottom,
      neckHalf,
      shoulderHalf,
      bustHalf,
      waistHalf,
      hipHalf,
      hemHalf,
      sleeveCuffY,
      sleeveBottomX,
      cx: CX,
    },
  };
}
