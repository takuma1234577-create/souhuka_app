import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from '@/config.firebase';

const apiKey = firebaseConfig.apiKey;
if (!apiKey || apiKey.length < 10) {
  throw new Error(
    'Firebase APIキーが読み込めていません。.env をプロジェクトルートに置くか、src/config.firebase.ts の fallback に値を設定してください。'
  );
}

const app = initializeApp(firebaseConfig as Record<string, string>);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export default app;
