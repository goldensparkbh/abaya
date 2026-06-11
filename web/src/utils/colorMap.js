const NAMED = {
  black: '#1c1c1e',
  navy: '#1f2a44',
  white: '#f5f5f0',
  beige: '#b8a994',
  'stone beige': '#b8a994',
  plum: '#5a2d3b',
  burgundy: '#5c1a2e',
  maroon: '#5c1a2e',
  grey: '#8a8a8a',
  gray: '#8a8a8a',
  charcoal: '#36454f',
  brown: '#6b4c3b',
  cream: '#f3e5d0',
  ivory: '#fffff0',
  gold: '#c9a227',
  rose: '#b76e79',
  pink: '#d4a5a5',
  green: '#2d4a3e',
  olive: '#556b2f',
  blue: '#2c4a6e',
  red: '#8b2635',
  purple: '#4a3052',
  taupe: '#8b7d6b',
  sand: '#c2b280',
  mocha: '#6f4e37',
  espresso: '#3c2415',
  camel: '#c19a6b',
  nude: '#e3bc9a',
};

function normalize(name) {
  return String(name || '').trim().toLowerCase();
}

function hashColor(name) {
  let hash = 0;
  const s = normalize(name);
  for (let i = 0; i < s.length; i += 1) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 42%, 42%)`;
}

export function isLightColor(hexOrHsl) {
  if (!hexOrHsl) return false;
  if (hexOrHsl.startsWith('hsl')) return false;
  const hex = hexOrHsl.replace('#', '');
  if (hex.length < 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.78;
}

export function buildColorLookup(platformColors = []) {
  const lookup = new Map();
  for (const c of platformColors) {
    if (c.name) lookup.set(normalize(c.name), c.hex);
    if (c.nameAr) lookup.set(normalize(c.nameAr), c.hex);
  }
  return lookup;
}

export function resolveColorHex(name, lookup = new Map()) {
  const key = normalize(name);
  if (!key) return '#9ca3af';
  if (lookup.has(key)) return lookup.get(key);
  if (NAMED[key]) return NAMED[key];
  if (key.startsWith('#') && (key.length === 7 || key.length === 4)) return name.trim();
  return hashColor(name);
}
