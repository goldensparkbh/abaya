const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function trim(s) {
  return (s || '').trim().replace(/^['"]|['"]$/g, '');
}

export function getGeminiKey() {
  return trim(import.meta.env.VITE_GEMINI_API_KEY);
}

export function geminiConfigured() {
  return !!getGeminiKey();
}

export function getVeoModel() {
  return trim(import.meta.env.VITE_VEO_MODEL) || 'veo-2.0-generate-001';
}

export async function startVeoGeneration({
  prompt,
  aspectRatio = '9:16',
  personGeneration = 'allow_adult',
  durationSeconds = 8,
  model,
} = {}) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set');
  const mdl = model || getVeoModel();
  const url = `${API_BASE}/models/${mdl}:predictLongRunning?key=${encodeURIComponent(apiKey)}`;
  const body = {
    instances: [{ prompt }],
    parameters: {
      aspectRatio,
      personGeneration,
      durationSeconds,
      numberOfVideos: 1,
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Veo request failed (${res.status}): ${txt.slice(0, 400)}`);
  }
  const data = await res.json();
  if (!data.name) throw new Error('Veo: no operation name returned');
  return data.name;
}

export async function checkOperation(operationName) {
  const apiKey = getGeminiKey();
  const url = `${API_BASE}/${operationName}?key=${encodeURIComponent(apiKey)}`;
  const r = await fetch(url);
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Polling failed (${r.status}): ${txt.slice(0, 400)}`);
  }
  return r.json();
}

export function extractVideoData(opResult) {
  if (!opResult) return null;
  const r = opResult.response || opResult.result || {};
  const samples =
    r.generateVideoResponse?.generatedSamples ||
    r.generatedVideos ||
    r.videos ||
    [];
  const first = samples[0];
  if (!first) return null;
  const uri =
    first?.video?.uri ||
    first?.uri ||
    first?.videoUri ||
    null;
  const bytes =
    first?.video?.bytesBase64Encoded ||
    first?.bytesBase64Encoded ||
    null;
  return { uri, bytes };
}

export async function pollUntilDone(operationName, { onTick, maxMs = 9 * 60 * 1000, intervalMs = 8000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const op = await checkOperation(operationName);
    if (onTick) onTick({ op, elapsedMs: Date.now() - start });
    if (op.done) {
      if (op.error) throw new Error(op.error.message || 'Veo error');
      return op;
    }
  }
  throw new Error('Veo timed out');
}

export function videoSrc({ uri, bytes }) {
  if (bytes) return `data:video/mp4;base64,${bytes}`;
  if (!uri) return null;
  const sep = uri.includes('?') ? '&' : '?';
  return `${uri}${sep}key=${encodeURIComponent(getGeminiKey())}`;
}

export async function downloadVideoBlob({ uri, bytes }) {
  if (bytes) {
    const bin = atob(bytes);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: 'video/mp4' });
  }
  const src = videoSrc({ uri });
  if (!src) throw new Error('No video URI');
  const r = await fetch(src);
  if (!r.ok) throw new Error(`Fetch video failed: ${r.status}`);
  return r.blob();
}

export function buildAbayaPrompt({ color, colorHex, fabric, sizes, description, title }) {
  const parts = [
    'Cinematic high-fashion editorial: a confident adult woman gracefully walking and posing in a custom-tailored modest abaya.',
    `Color: ${color}${colorHex ? ` (${colorHex})` : ''}.`,
    `Fabric: ${fabric}, with the natural drape and texture of ${String(fabric).toLowerCase()}.`,
    sizes?.length ? `Approximate length ${sizes.length}cm with ${sizes.sleeve}cm sleeves and modest neckline.` : '',
    title ? `Design name: "${title}".` : '',
    description ? `Design notes: ${description}.` : '',
    'Setting: luxurious dimly-lit studio with warm spotlights, polished marble floor with subtle reflections, soft volumetric haze, dramatic rim lighting.',
    'Camera: slow dolly around the model showing front, three-quarter, and side angles; fabric flows naturally as she turns. Soft depth of field.',
    'Style: ultra-realistic, 8K, soft film grain, high-end fashion editorial cinematography. Modest framing, dignified pose.',
  ];
  return parts.filter(Boolean).join(' ');
}
