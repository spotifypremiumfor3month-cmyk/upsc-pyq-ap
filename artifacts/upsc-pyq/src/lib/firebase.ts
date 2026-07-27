import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import workspace firebase configuration
import config from '../../../../firebase-applet-config.json';

const firebaseConfig = {
  // API key comes from the GOOGLE_API_KEY Replit secret, exposed via envPrefix
  apiKey: (import.meta.env.GOOGLE_API_KEY as string) || config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId || undefined,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);
export default app;
