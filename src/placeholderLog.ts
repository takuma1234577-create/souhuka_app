import type { MuscleGroup } from './constants';
import { getLogsByMuscle } from './storage';

/**
 * 種目選択時に表示する「前回の自分」基準のプレースホルダー用データ
 */
export interface LastSuggestedInputs {
  weight: number;
  reps: number;
  sets: number;
}

/**
 * 指定部位（と種目）の直近ログから、重量・回数・セット数を取得する
 * インテリジェント・プレースホルダー用（前回の自分を基準にできる）
 */
export function getLastSuggestedInputs(
  muscleGroup: MuscleGroup,
  exerciseName?: string
): LastSuggestedInputs | null {
  const logs = getLogsByMuscle(muscleGroup);
  const log = exerciseName
    ? logs.find((l) => l.exerciseName === exerciseName) ?? logs[0]
    : logs[0];
  if (!log?.sets?.length) return null;
  const first = log.sets[0];
  return {
    weight: first.weight,
    reps: first.reps,
    sets: log.sets.length,
  };
}
