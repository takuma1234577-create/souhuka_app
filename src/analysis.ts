/**
 * 総負荷量（ボリューム）の比較・分析ロジック（筋肥大トレーニング分析）
 */
import type { MuscleGroup } from './constants';
import { getLogs, getLogsByMuscle } from './storage';
import { calculateVolumeFromSets } from './calculators';
import type {
  VolumeDiffResult,
  WeeklyVolumeSummary,
  WeeklyReportResult,
  PersonalBestResult,
  WorkoutLog,
} from './types';

/**
 * 指定部位の「前回の記録」を検索し、今回のボリュームとの増減率（％）を算出する
 * 総負荷量・筋肥大の進捗比較に使用
 * @param currentVolume 今回の総負荷量（ボリューム）
 * @param muscleGroup 部位（胸・背中など）
 * @returns 前回比の増減率と前回ボリューム
 */
export function getVolumeDiff(
  currentVolume: number,
  muscleGroup: MuscleGroup
): VolumeDiffResult {
  const logs = getLogsByMuscle(muscleGroup);
  if (logs.length === 0) {
    return {
      previousVolume: 0,
      currentVolume,
      diffPercent: 0,
      previousRecordedAt: '',
      noPreviousRecord: true,
    };
  }
  // 直近が「今回」だと仮定せず、直近1件を「前回」として、今回との差を出す
  const previousLog = logs[0];
  const previousVolume = calculateVolumeFromSets(previousLog.sets);

  const diffPercent =
    previousVolume === 0
      ? (currentVolume > 0 ? 100 : 0)
      : Math.round(((currentVolume - previousVolume) / previousVolume) * 1000) / 10;

  return {
    previousVolume,
    currentVolume,
    diffPercent,
    previousRecordedAt: previousLog.recordedAt,
    noPreviousRecord: false,
  };
}

/**
 * ログを直近4週間でグループ化し、週ごとの総負荷量（ボリューム）を集計する
 * 全身・部位別のどちらでも同じ集計ロジックで利用
 */
function aggregateByWeek(logs: WorkoutLog[]): WeeklyVolumeSummary[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const toMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - toMonday);

  const summaries: WeeklyVolumeSummary[] = [];

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekStart.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    let totalVolume = 0;
    let logCount = 0;
    for (const log of logs) {
      const d = new Date(log.recordedAt);
      if (d >= weekStart && d <= weekEndDate) {
        totalVolume += calculateVolumeFromSets(log.sets);
        logCount += 1;
      }
    }

    summaries.push({
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEndDate.toISOString().slice(0, 10),
      totalVolume,
      logCount,
    });
  }

  return summaries;
}

/**
 * 直近4週間の週ごとの合計ボリューム（総負荷量）を算出する
 * 週は月曜始まりで集計（筋肥大・ボリュームトレーニングの週次トレンド）
 * @param muscleGroup 省略時は全身の合計、指定時はその部位だけの推移を返す
 */
export function getWeeklyTrend(muscleGroup?: MuscleGroup): WeeklyVolumeSummary[] {
  const logs = muscleGroup ? getLogsByMuscle(muscleGroup) : getLogs();
  return aggregateByWeek(logs);
}

/**
 * 保存前に「自己ベスト」かどうかを判定する（部位・種目ごとの過去最高ボリュームと比較）
 * モチベーション演出・王冠表示用
 */
export function checkPersonalBest(
  muscleGroup: MuscleGroup,
  currentVolume: number,
  exerciseName?: string
): PersonalBestResult {
  const logs = getLogsByMuscle(muscleGroup);
  const targetLogs = exerciseName
    ? logs.filter((l) => l.exerciseName === exerciseName)
    : logs;
  const volumes = targetLogs.map((l) => calculateVolumeFromSets(l.sets));
  const previousBest = volumes.length > 0 ? Math.max(...volumes) : 0;
  const isPersonalBest = currentVolume > previousBest;
  return {
    isPersonalBest,
    previousBest,
    currentVolume,
  };
}

/**
 * 週次サマリーレポート（今週 vs 先週の総負荷量比較）
 * ダッシュボード上部のポジティブフィードバック用
 */
export function getWeeklyReport(muscleGroup?: MuscleGroup): WeeklyReportResult {
  const trend = getWeeklyTrend(muscleGroup);
  const thisWeek = trend[0] ?? { totalVolume: 0 };
  const lastWeek = trend[1] ?? { totalVolume: 0 };
  const thisWeekVolume = thisWeek.totalVolume;
  const lastWeekVolume = lastWeek.totalVolume;
  const diff = thisWeekVolume - lastWeekVolume;
  const diffPercent =
    lastWeekVolume === 0
      ? (thisWeekVolume > 0 ? 100 : 0)
      : Math.round((diff / lastWeekVolume) * 1000) / 10;
  const isIncrease = diff > 0;

  let message: string;
  if (isIncrease) {
    message = `今週は先週より${diff.toLocaleString()}kg増加しました！`;
  } else if (diff < 0) {
    message = '現状維持・回復中。また次週から積み上げていきましょう！';
  } else {
    message = '先週と同ペース。この調子で継続を！';
  }

  return {
    thisWeekVolume,
    lastWeekVolume,
    diff,
    diffPercent,
    message,
    isIncrease,
  };
}
