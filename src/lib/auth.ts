import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export type AuthUser = User;

export async function signInWithGoogle(): Promise<AuthUser> {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return result.user;
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
