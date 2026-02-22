import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  updateDoc,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { WorkoutLog } from '@/types';

const USERS_COLLECTION = 'users';
const WORKOUT_LOGS_SUBCOLLECTION = 'workoutLogs';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  isPremium: boolean;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    isPremium: data.isPremium === true,
  };
}

export async function setUserProfile(
  uid: string,
  data: { email?: string; displayName?: string; isPremium?: boolean }
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, data);
  } else {
    await setDoc(ref, {
      email: data.email ?? null,
      displayName: data.displayName ?? null,
      isPremium: data.isPremium ?? false,
    });
  }
}

export async function setIsPremium(uid: string, isPremium: boolean): Promise<void> {
  await setUserProfile(uid, { isPremium });
}

function workoutLogToFirestore(log: WorkoutLog): Record<string, unknown> {
  return {
    id: log.id,
    muscleGroup: log.muscleGroup,
    exerciseName: log.exerciseName,
    sets: log.sets,
    recordedAt: log.recordedAt,
    memo: log.memo ?? null,
  };
}

function firestoreToWorkoutLog(data: Record<string, unknown>): WorkoutLog {
  return {
    id: String(data.id),
    muscleGroup: data.muscleGroup as WorkoutLog['muscleGroup'],
    exerciseName: String(data.exerciseName),
    sets: Array.isArray(data.sets)
      ? (data.sets as Array<{ weight: number; reps: number }>)
      : [],
    recordedAt: String(data.recordedAt),
    memo: data.memo != null ? String(data.memo) : undefined,
  };
}

export async function saveWorkoutLog(uid: string, log: WorkoutLog): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid, WORKOUT_LOGS_SUBCOLLECTION, log.id);
  await setDoc(ref, workoutLogToFirestore(log));
}

export async function deleteWorkoutLog(uid: string, logId: string): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid, WORKOUT_LOGS_SUBCOLLECTION, logId);
  await deleteDoc(ref);
}

export async function getWorkoutLogs(uid: string): Promise<WorkoutLog[]> {
  const col = collection(db, USERS_COLLECTION, uid, WORKOUT_LOGS_SUBCOLLECTION);
  const snap = await getDocs(col);
  const logs = snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return firestoreToWorkoutLog({ ...data, id: data.id ?? d.id });
  });
  return logs.sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
}

export async function setWorkoutLogs(uid: string, logs: WorkoutLog[]): Promise<void> {
  const col = collection(db, USERS_COLLECTION, uid, WORKOUT_LOGS_SUBCOLLECTION);
  const existing = await getDocs(col);
  const batch = writeBatch(db);
  existing.docs.forEach((d) => batch.delete(d.ref));
  logs.forEach((log) => {
    const ref = doc(db, USERS_COLLECTION, uid, WORKOUT_LOGS_SUBCOLLECTION, log.id);
    batch.set(ref, workoutLogToFirestore(log));
  });
  await batch.commit();
}

export function subscribeWorkoutLogs(
  uid: string,
  onLogs: (logs: WorkoutLog[]) => void
): Unsubscribe {
  const col = collection(db, USERS_COLLECTION, uid, WORKOUT_LOGS_SUBCOLLECTION);
  return onSnapshot(col, (snap) => {
    const logs = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return firestoreToWorkoutLog({ ...data, id: data.id ?? d.id });
    });
    onLogs(
      logs.sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      )
    );
  });
}

export function subscribeUserProfile(
  uid: string,
  onProfile: (profile: UserProfile | null) => void
): Unsubscribe {
  const ref = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onProfile(null);
      return;
    }
    const data = snap.data();
    onProfile({
      uid,
      email: data.email,
      displayName: data.displayName,
      isPremium: data.isPremium === true,
    });
  });
}
