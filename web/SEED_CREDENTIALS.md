# Demo account credentials

Run the seed script first:

```bash
cd web
npm run seed
```

## Login credentials

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Customer** | `customer@demo.abaya.bh` | `AbayaDemo2026!` | Browse shop, cart, custom design, orders |
| **Shop** | `shop@demo.abaya.bh` | `AbayaDemo2026!` | Al Noor Atelier — manage products & view orders |
| **Admin** | `admin@demo.abaya.bh` | `AbayaDemo2026!` | Full admin panel at `/admin` |

## What gets seeded

- 3 Firebase Auth users with Firestore profiles
- **Al Noor Atelier** shop with 4 sample abaya products
- **AI-generated images** for all products, shop logo, and measurement guide
  - Local copies live in `web/public/img/seed/`
  - Uploaded to Firebase Storage on seed (with local fallback)
- Platform settings (currency, fees, AI measurement guide)
- TAP Payment sandbox config (disabled by default)
- Custom design materials (Crepe, Nida, Chiffon, Linen)
- Custom design colours (Black, Navy, Stone Beige, Plum)

## Re-run safely

The script is idempotent — existing users are updated, and products are only added if the shop has fewer than 4 listings.
