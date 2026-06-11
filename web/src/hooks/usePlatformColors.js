import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase.js';
import { listColors } from '../services/settings.js';
import { buildColorLookup } from '../utils/colorMap.js';

export default function usePlatformColors() {
  const [colors, setColors] = useState([]);

  useEffect(() => {
    if (!db) return;
    listColors(true).then(setColors).catch(() => setColors([]));
  }, []);

  const lookup = useMemo(() => buildColorLookup(colors), [colors]);

  return { colors, lookup };
}
