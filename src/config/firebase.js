import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'pricevprice-00'
  });
}

export const db = getFirestore();
