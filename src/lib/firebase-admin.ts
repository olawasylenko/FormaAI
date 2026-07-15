import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Brak zmiennej środowiskowej: ${name}`);
  }

  return value;
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: requiredEnvironmentVariable(
            "FIREBASE_ADMIN_PROJECT_ID"
          ),
          clientEmail: requiredEnvironmentVariable(
            "FIREBASE_ADMIN_CLIENT_EMAIL"
          ),
          privateKey: requiredEnvironmentVariable(
            "FIREBASE_ADMIN_PRIVATE_KEY"
          ).replace(/\\n/g, "\n"),
        }),
      });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
