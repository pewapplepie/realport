import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function privateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function initFirebaseAdmin() {
  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const key = privateKey();

  if (projectId && clientEmail && key) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: key,
      }),
    });
  }

  return initializeApp();
}

export function firestoreDb() {
  return getFirestore(initFirebaseAdmin());
}
