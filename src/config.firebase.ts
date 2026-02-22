/**
 * Firebase 設定（.env が読めない場合のフォールバック）
 * 下の fallback に値を貼ると確実に読み込まれます。.env が効いていれば .env が優先されます。
 * 本番では authDomain をアプリのドメイン（souhuka.com）に揃えると Google リダイレクトログインが安定します。
 */
const fallback = {
  apiKey: 'AIzaSyBCLNjNtzkb38ZtPB1GKVrE9_huvxdt5Z0',
  authDomain: 'souhukaapp.firebaseapp.com',
  projectId: 'souhukaapp',
  storageBucket: 'souhukaapp.firebasestorage.app',
  messagingSenderId: '689635442686',
  appId: '1:689635442686:web:e0fd1626dbfe612a014aaf',
};

/** 本番ドメイン（Google ログインのリダイレクトを同じオリジンにする） */
const PRODUCTION_AUTH_DOMAIN = 'souhuka.com';

export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || fallback.apiKey,
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) ||
    (import.meta.env.PROD ? PRODUCTION_AUTH_DOMAIN : fallback.authDomain),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || fallback.projectId,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || fallback.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || fallback.messagingSenderId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || fallback.appId,
};
