/**
 * ワークアウトログのLocalStorage / Firestore 同期（総負荷量・ボリューム記録）
 * ログイン時は Firestore のデータを優先するため、Provider が setLogsOverride で上書きする
 */
import { STORAGE_KEYS } from './constants';
import type { MuscleGroup } from './constants';
import type { WorkoutLog } from './types';

let logsOverride: WorkoutLog[] | null = null;

/** ログイン中は Firestore 由来のログを getLogs で返すために設定する */
export function setLogsOverride(logs: WorkoutLog[] | null): void {
  logsOverride = logs;
}

/**
 * ワークアウトデータをLocalStorageに保存する（未ログイン時のみ使用）
 * 既存のidがあれば更新、なければ新規追加
 */
export function saveLog(log: WorkoutLog): WorkoutLog {
  const logs = getLogsFromStorage();
  const index = logs.findIndex((l) => l.id === log.id);
  const toSave: WorkoutLog = {
    ...log,
    recordedAt: log.recordedAt || new Date().toISOString(),
  };
  if (index >= 0) {
    logs[index] = toSave;
  } else {
    logs.push(toSave);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(logs));
  }
  return toSave;
}

function getLogsFromStorage(): WorkoutLog[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
  if (!raw) return [];
  try {
    const logs: WorkoutLog[] = JSON.parse(raw);
    return logs.sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * 全ワークアウトログを取得する（総負荷量・ボリュームデータ）
 * ログイン中は Firestore の上書き分を返し、未ログインは LocalStorage
 */
export function getLogs(): WorkoutLog[] {
  if (logsOverride !== null) return logsOverride;
  return getLogsFromStorage();
}

/**
 * 指定した部位（胸・背中など）の過去データを取得する
 * 総負荷量比較・筋肥大トレーニングの部位別分析に使用
 */
export function getLogsByMuscle(muscleGroup: MuscleGroup): WorkoutLog[] {
  const logs = getLogs();
  return logs
    .filter((l) => l.muscleGroup === muscleGroup)
    .sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
}
