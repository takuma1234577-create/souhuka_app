import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export type AuthUser = User;

/** Google ログイン（ポップアップ優先。ブロック時はリダイレクトにフォールバック） */
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (popupError: unknown) {
    const msg = (popupError as Error)?.message ?? '';
    const isPopupBlocked =
      /popup|blocked|cross-origin|closed/i.test(msg) || (popupError as { code?: string })?.code === 'auth/popup-blocked';
    if (isPopupBlocked) {
      await signInWithRedirect(auth, provider);
    } else {
      throw popupError;
    }
  }
}

/** リダイレクト後の結果を取得。アプリ起動時に1回呼ぶ */
export async function getGoogleRedirectResult(): Promise<AuthUser | null> {
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthUser> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
