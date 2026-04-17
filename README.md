# RealPort

RealPort is a static Next.js app for tracking real-estate properties,
transactions, dashboard analytics, leverage opportunities, and buy-vs-rent
scenario analysis.

The deployed app is designed for GitHub Pages plus Firebase Spark:

- GitHub Pages serves the static site from `out/`.
- Firebase Authentication handles email/password sign-in.
- Cloud Firestore stores each user's properties and transactions.
- Firestore security rules limit users to their own records.

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase Setup

Enable these Firebase products:

1. Authentication → Sign-in method → Email/Password
2. Firestore Database

Deploy the Firestore rules:

```bash
firebase deploy --only firestore:rules
```

The committed web config points at the `realport-e8abb` Firebase web app. To use
another project locally, copy `.env.example` to `.env.local` and set the
`NEXT_PUBLIC_FIREBASE_*` values.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds the static app and
publishes `out/` to GitHub Pages.

In GitHub:

1. Open repository Settings.
2. Go to Pages.
3. Set Source to GitHub Actions.
4. Push to `main`.

The project Pages URL should be:

```text
https://pewapplepie.github.io/realport/
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
```
