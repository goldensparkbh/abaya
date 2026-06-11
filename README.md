# Abaya Boutique (React + Firebase)

The storefront now lives in **`web/`** (Vite + React). Customer flows (catalog, cart, checkout, orders, custom request form) use **Firebase Authentication** and **Cloud Firestore**. Static hosting is configured for **Firebase Hosting** via `firebase.json` (build output: `web/dist`).

Legacy PHP + MySQL files remain in the repository root for reference; new development targets the React app.

![𝚅𝚒𝚜𝚒𝚝𝚘𝚛𝚜](https://visitor-badge.laobi.icu/badge?page_id=ajayrandhawa.Basic-Bootstrap-Php-Ecommerce&title=Visitor )

Originally: Basic HTML, Bootstrap, PHP ecommerce with MySQL. The SQL snapshot is still under `database/ab_db.sql` for migrating data ideas into Firestore or `web/src/data/catalog.js`.

## Features: 

1. Login
2. Register
3. Product Listing
4. Cart Manage
5. Delivery Address Page
6. CheckOut

<img src="sc.png" />

## Run the React app

1. `cd web`
2. `cp .env.example .env` (Windows: copy) and paste values from Firebase console → Project settings → Your apps → Web app config.
3. `npm install` then `npm run dev` for local development, or `npm run build` for production assets in `web/dist`.

## Deploy to Firebase Hosting

1. Install Firebase CLI (`npm i -g firebase-tools`), run `firebase login`, and set `.firebaserc` `default` to your project id.
2. Enable **Firestore** and **Authentication (Email/Password)** in the Firebase console.
3. `firebase deploy --only firestore:rules` then `firebase deploy --only hosting` from the repo root (after `npm run build` inside `web/`).

Set a user’s `role` field on their document at `users/{uid}` to `admin`, `business`, or `tailor` in Firestore if they should access those dashboards (customers default to `customer` on registration).

Feel Free To Contribute :)
# abaya
