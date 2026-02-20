/**
 * 筋トレ総負荷量（ボリューム）管理アプリ - バックエンドロジック
 * 総負荷量・筋肥大・ボリュームトレーニングの計算・ストレージ・分析を提供
 */

export { calculateVolume, calculateVolumeFromSets, calculate1RM } from './calculators';
export { saveLog, getLogs, getLogsByMuscle } from './storage';
export { getVolumeDiff, getWeeklyTrend, checkPersonalBest, getWeeklyReport } from './analysis';
export {
  MUSCLE_GROUPS,
  EXERCISE_NAMES,
  STORAGE_KEYS,
  ASO_KEYWORDS,
} from './constants';
export type { MuscleGroup } from './constants';
export type {
  WorkoutLog,
  ExerciseSet,
  WeeklyVolumeSummary,
  VolumeDiffResult,
  PersonalBestResult,
  WeeklyReportResult,
} from './types';
