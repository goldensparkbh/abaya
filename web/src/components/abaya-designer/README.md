# AI Abaya Designer Module

Embeddable React module for custom abaya design: measurements → fit engine → 3D preview → GLB export → tailor production sheet.

## Install dependencies

From `web/`:

```bash
npm install three @react-three/fiber@^8 @react-three/drei@^9
npm install -D typescript tailwindcss postcss autoprefixer
```

Already included in this repo if you ran `npm install` after pulling.

## Folder structure

```
src/components/abaya-designer/   UI components
src/lib/abaya-designer/          Fit rules, pattern, GLB export, validation
src/types/abaya-designer/        TypeScript types
src/data/abaya-designer/         Fabrics & style catalogs
```

## Integrate into your existing website

### 1. Add a route (this project)

`App.jsx`:

```jsx
import AbayaDesignerPage from './pages/AbayaDesignerPage.jsx';

<Route path="/design" element={<AbayaDesignerPage />} />
```

Visit `/design`.

### 2. Embed on any page

```tsx
import { AbayaDesignerModule } from '@/components/abaya-designer';

export default function CustomAbayaPage() {
  return (
    <main>
      <AbayaDesignerModule
        brandColor="#2f4f4f"
        onDesignChange={(data) => console.log(data)}
        onSubmitDesign={(data) => sendToYourBackend(data)}
      />
    </main>
  );
}
```

### 3. Props

| Prop | Type | Description |
|------|------|-------------|
| `initialData` | `Partial<AbayaDesignState>` | Pre-fill measurements / style |
| `onDesignChange` | `(data) => void` | Fires on every update |
| `onSubmitDesign` | `(data) => void` | Fires when user clicks Submit on production step |
| `brandColor` | `string` | Accent color for buttons |

## Features

- Body measurement form with validation
- Modest fit engine (Comfort / Loose / Very Loose) with safety minimums
- Style, fabric, color selectors
- Live 3D preview (React Three Fiber)
- Export `.glb` via Three.js GLTFExporter
- Printable tailor production sheet
- AI photo measurement placeholder (types only — not implemented)

## Tailwind

Module CSS is scoped via `abaya-designer.css` with `preflight: false` so Bootstrap on other pages is unaffected.

## Copy to another project

Copy these folders:

- `src/components/abaya-designer/`
- `src/lib/abaya-designer/`
- `src/types/abaya-designer/`
- `src/data/abaya-designer/`

Configure path alias `@/` → `src/` in `vite.config.js` / `tsconfig.json`, enable Tailwind content paths for the module folder, import `abaya-designer.css` once from the module entry.

## Future AI measurement

See `src/lib/abaya-designer/aiMeasurementPlaceholder.ts` and `src/types/abaya-designer/aiMeasurement.ts`.
