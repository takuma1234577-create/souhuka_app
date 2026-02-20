import type { MuscleGroup } from './constants';

/**
 * 1回のワークアウト種目記録（総負荷量・ボリューム計算の単位）
 */
export interface ExerciseSet {
  /** 重量 (kg) */
  weight: number;
  /** レップ数 */
  reps: number;
}

/**
 * ワークアウトログ1件（筋肥大・ボリューム管理用）
 */
export interface WorkoutLog {
  /** 一意ID */
  id: string;
  /** 部位（筋肉グループ） */
  muscleGroup: MuscleGroup;
  /** 種目名 */
  exerciseName: string;
  /** セットごとの weight, reps */
  sets: ExerciseSet[];
  /** 記録日時（ISO文字列） */
  recordedAt: string;
  /** メモ（任意） */
  memo?: string;
}

/**
 * 週次トレンド用の集計結果（直近4週間のボリューム）
 */
export interface WeeklyVolumeSummary {
  /** 週の開始日（ISO日付文字列 YYYY-MM-DD） */
  weekStart: string;
  /** 週の終了日 */
  weekEnd: string;
  /** その週の合計総負荷量（ボリューム） */
  totalVolume: number;
  /** その週のログ数 */
  logCount: number;
}

/**
 * 前回比の増減率結果（総負荷量の比較）
 */
export interface VolumeDiffResult {
  /** 前回の総負荷量（ボリューム） */
  previousVolume: number;
  /** 今回の総負荷量 */
  currentVolume: number;
  /** 増減率（％）。正で増加、負で減少 */
  diffPercent: number;
  /** 前回の記録日（ISO文字列） */
  previousRecordedAt: string;
  /** 前回ログが存在しない場合 true */
  noPreviousRecord: boolean;
}

/**
 * 自己ベスト判定結果（モチベーション演出用）
 */
export interface PersonalBestResult {
  /** 今回が自己ベスト更新か */
  isPersonalBest: boolean;
  /** これまでの最高ボリューム（更新前） */
  previousBest: number;
  /** 今回のボリューム */
  currentVolume: number;
}

/**
 * 週次サマリーレポート（今週 vs 先週）
 */
export interface WeeklyReportResult {
  /** 今週の合計総負荷量 */
  thisWeekVolume: number;
  /** 先週の合計総負荷量 */
  lastWeekVolume: number;
  /** 差分（今週 - 先週） */
  diff: number;
  /** 増減率（％） */
  diffPercent: number;
  /** 表示用メッセージ */
  message: string;
  /** 今週の方が多いか */
  isIncrease: boolean;
}
