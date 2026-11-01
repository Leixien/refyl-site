# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and vanilla JavaScript, no build step, served by GitHub Pages from `main` (repo `Leixien/refyl-site`). Links stay relative so the site works under `leixien.github.io/refyl-site/` today and on a custom domain later (the owner plans to buy one).

## Users

Drivers in Italy. Two real scenes: a quick glance in the car with the phone on the dashboard holder, and a calm comparison before leaving. On this site they are mostly people deciding whether to install Refyl, plus App Review checking the support and privacy URLs.

## Product Purpose

Refyl is a free iPhone app that shows the cheapest fuel station nearby, at a glance, from the official prices station operators must report to the Italian Ministry of Enterprises (MIMIT – Osservaprezzi Carburanti, IODL 2.0). The site's job: let a visitor understand and try that mechanism, then install the app; host the privacy policy and support page the App Store requires.

## Positioning

Official government price data, refreshed daily, with no ads, no account and no data collected; the code is open source. The app downloads one public file and never sends the user's location anywhere.

## Operating Context

- The public price file `https://leixien.github.io/FuelFinder_DATA/stations.json` (about 21,500 stations, fields: id, name, brand, address, city, province, lat, lon, prices[fuel, price, self, updated_at]; top-level `prices_reference_date`, `generated_at`, `fuel_types`). Same origin family as the site, CORS open. About 13 MB uncompressed.
- Fuel types: benzina, gasolio, gpl, metano, gnl, hvo, benzina_special, gasolio_special. Self-service vs attended.
- A price older than 7 days is flagged as stale in the app.
- App Store app id 6829368006; the store link works only after release.

## Capabilities and Constraints

- The site may fetch the public price file and use browser geolocation; location must stay in the browser, never sent anywhere.
- No cookies, no analytics, no third-party scripts, fonts or map tiles (the privacy page states this; keep it true).
- Italian at the root, English under `/en/`. Pages: home, privacy (`/privacy/`, `/en/privacy/`), support (`/supporto/`, `/en/support/`).
- Support contact: `contactus@binarybuilders.dev`. Copyright: 2026 Giuseppe Scappaticci.
- Android version: in preparation, not announced.

## Brand Commitments

- Name **Refyl**; icon in `assets/icon.svg` (from `FuelFinder_IOS/docs/brand/icon/`).
- App semantic colours: cheapest/best green `#248A3D` light, `#30D158` dark (text on it white / black); stale price orange `#C93400` light, `#FF9F0A` dark. Icon ground `#F4F5F0`.
- Voice: plain, direct, honest; says what it does and what it does not do.

## Evidence on Hand

- Real app screenshots, framed with captions, IT and EN: `assets/shots/{it,en}/1-home … 5-dark.jpg` (sources in `FuelFinder_IOS/docs/release/screenshots/`).
- Real daily price data (above).
- App Store listing copy: `FuelFinder_IOS/docs/release/app-store-listing.md`.
- No reviews, ratings, download counts, press or testimonials exist; never invent them.

## Product Principles

1. Show, don't claim: the real data is the proof.
2. Privacy is literal: nothing leaves the visitor's device except fetching the public file.
3. The cheapest option must be readable in one glance.
4. Honest about freshness: show how old a price is.

## Accessibility & Inclusion

Large text and VoiceOver are supported in the app; the site matches: WCAG AA contrast, keyboard access, reduced motion respected, meaningful text alternatives for any visual map.
