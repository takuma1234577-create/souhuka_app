/**
 * ワークアウトログのLocalStorage管理（総負荷量・ボリューム記録）
 */
import { STORAGE_KEYS } from './constants';
import type { MuscleGroup } from './constants';
import type { WorkoutLog } from './types';

/**
 * ワークアウトデータをLocalStorageに保存する（総負荷量ログ）
 * 既存のidがあれば更新、なければ新規追加
 */
export function saveLog(log: WorkoutLog): WorkoutLog {
  const logs = getLogs();
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

/**
 * 全ワークアウトログを取得する（総負荷量・ボリュームデータ）
 * 記録日時の新しい順
 */
export function getLogs(): WorkoutLog[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }
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
