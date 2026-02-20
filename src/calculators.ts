/**
 * 筋トレ総負荷量（ボリューム）・1RM 計算ロジック
 * 総負荷量 = 重量 × レップ × セット数（筋肥大・ボリュームトレーニングの指標）
 */

/**
 * 総負荷量（ボリューム）を計算する
 * 公式: 重量 × レップ数 × セット数
 * @param weight 重量 (kg)
 * @param reps レップ数
 * @param sets セット数
 * @returns 総負荷量（ボリューム）
 */
export function calculateVolume(weight: number, reps: number, sets: number): number {
  if (weight < 0 || reps < 0 || sets < 0) {
    return 0;
  }
  return Math.round(weight * reps * sets);
}

/**
 * 複数セットから総負荷量（ボリューム）を計算する
 * 各セットの (weight × reps) を合計
 */
export function calculateVolumeFromSets(
  sets: Array<{ weight: number; reps: number }>
): number {
  return sets.reduce(
    (sum, s) => sum + (s.weight >= 0 && s.reps >= 0 ? s.weight * s.reps : 0),
    0
  );
}

/**
 * エプリー式で推定1RMを計算する
 * 1RM = 重量 × (1 + レップ数 / 30)
 * @param weight 重量 (kg)
 * @param reps レップ数（1のときはそのまま重量を返す）
 * @returns 推定1RM (kg)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (weight <= 0) return 0;
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  const oneRm = weight * (1 + reps / 30);
  return Math.round(oneRm * 10) / 10;
}
