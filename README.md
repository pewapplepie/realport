# RealPort

RealPort is a static Next.js app for tracking a real-estate portfolio, testing
new leveraged purchases, and comparing home-buying against renting and
investing.

The app is deployed with GitHub Pages and uses Firebase on the client side for
auth and data storage.

## What The App Does

- Portfolio dashboard with property-level and portfolio-level rollups
- Property and transaction tracking stored in Cloud Firestore
- Opportunity calculator for leveraged purchases
- Buy-vs-rent analytics for first-time home decisions
- Firebase email/password authentication

## Core Pages

- `/dashboard`  
  Portfolio summary, cash flow, allocation, and property comparisons
- `/properties`  
  Property list, details, and edit flows
- `/transactions`  
  Income and expense tracking by property
- `/opportunity`  
  Purchase stack calculator for new opportunities
- `/analytics`  
  Buy house vs rent-and-invest comparison

## Opportunity Calculator Highlights

The opportunity page supports:

- Multiple new purchases in one scenario
- Multiple existing cash-flowing properties
- Synced equity loan sized off the down payment
- Optional financing of:
  - closing fee
  - mansion tax for purchases above `$1,000,000`
- Monthly HOA and monthly tax for each new purchase
- Heatmap comparison across two selected variables
- A fixed-assumptions panel so users can still see the values that are not
  changing in the heatmap

## Analytics Highlights

The analytics page compares:

- buying a target home
- renting and investing the difference

It includes:

- target home assumptions
- terminal home price assumptions
- investment-return assumptions
- holding-period comparison
- optional U.S. tax analysis inputs

## Tech Stack

- Next.js 16
- React 19
- Firebase Authentication
- Cloud Firestore
- Recharts
- Tailwind CSS 4

## Deployment Model

RealPort is set up for:

- **GitHub Pages** for static hosting
- **Firebase Authentication** for sign-in
- **Cloud Firestore** for portfolio data

This repo uses static export mode, so there is no required custom Node backend
in production.

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open either:

- [http://localhost:3000](http://localhost:3000)
- [http://127.0.0.1:3000](http://127.0.0.1:3000)

`127.0.0.1` is allowed in dev config so the in-app browser can use local hot
reload cleanly.

## Firebase Setup

Enable these Firebase products in your Firebase project:

1. Authentication -> Sign-in method -> Email/Password
2. Firestore Database

Also add your production GitHub Pages domain to Firebase Authentication
authorized domains. For this repo that is usually:

```text
pewapplepie.github.io
```

If you use a custom Firebase project locally, copy `.env.example` to
`.env.local` and set:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Firestore Rules

Deploy Firestore rules with:

```bash
firebase deploy --only firestore:rules
```

The rules should restrict each user to their own portfolio records.

## GitHub Pages Deployment

The workflow at `.github/workflows/deploy-pages.yml` builds and publishes the
static site.

In GitHub:

1. Open repository **Settings**
2. Open **Pages**
3. Set **Source** to **GitHub Actions**
4. Push to `main`

Expected Pages URL:

```text
https://pewapplepie.github.io/realport/
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Notes

- The login and register pages can prefill from query params for testing, but
  credentials should not be shared through URLs in normal use.
- Dollar-denominated inputs are formatted with comma separators across the main
  calculators and forms.
