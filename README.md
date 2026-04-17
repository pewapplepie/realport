# RealPort

RealPort is a Next.js portfolio app for tracking real-estate properties,
transactions, dashboard analytics, leverage opportunities, and buy-vs-rent
scenario analysis.

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase Setup

The app uses Firebase Admin SDK on the server and stores app data in Cloud
Firestore collections:

- `users`
- `properties`
- `transactions`

For local API-route development, copy `.env.example` to `.env` and fill in:

```bash
JWT_SECRET="replace-with-a-long-random-secret"
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

For Firebase App Hosting, connect this GitHub repository in the Firebase
console. The Firebase Admin SDK can use the default Google credentials in that
environment. Set `JWT_SECRET` as a runtime secret before publishing.

## Deployment

This is a full-stack Next.js app with API routes, so use Firebase App Hosting
instead of GitHub Pages. In Firebase Console:

1. Create or select a Firebase project.
2. Enable Cloud Firestore.
3. Open App Hosting and create a backend.
4. Connect the GitHub repo and choose the `main` branch.
5. Set the app root directory to `/`.
6. Add a runtime secret named `JWT_SECRET`.
7. Deploy.

After the backend is created, each push to the connected branch can trigger a
new rollout.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
