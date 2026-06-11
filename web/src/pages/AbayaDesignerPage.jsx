import { AbayaDesignerModule } from '@/components/abaya-designer';

/**
 * Sample integration page — drop this route into your existing site.
 *
 * In App.jsx:
 *   import AbayaDesignerPage from './pages/AbayaDesignerPage.jsx';
 *   <Route path="/design" element={<AbayaDesignerPage />} />
 */
export default function AbayaDesignerPage() {
  return (
    <AbayaDesignerModule
      brandColor="#2f4f4f"
      onDesignChange={(data) => {
        // Optional: sync to parent state, URL, or localStorage
        if (import.meta.env.DEV) console.debug('[AbayaDesigner]', data.step, data.garment?.garmentLength);
      }}
      onSubmitDesign={(data) => {
        alert(`Design ready for ${data.customer.name}. Connect onSubmitDesign to your order API.`);
      }}
    />
  );
}
