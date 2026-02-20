import { ClipboardList, Lock } from 'lucide-react';
import { getLogs } from '@/storage';
import { calculateVolumeFromSets } from '@/calculators';

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

interface HistoryViewProps {
  isPremium: boolean;
}

export function HistoryView({ isPremium }: HistoryViewProps) {
  const allEntries = getLogs();
  const cutoff = Date.now() - ONE_MONTH_MS;
  const visibleEntries = isPremium
    ? allEntries
    : allEntries.filter((e) => new Date(e.recordedAt).getTime() >= cutoff);
  const hasLocked = !isPremium && allEntries.some((e) => new Date(e.recordedAt).getTime() < cutoff);

  if (allEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
          <ClipboardList className="size-7 text-muted/40" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted">まだ記録がありません</p>
          <p className="text-xs text-muted/50">
            記録タブでトレーニングを保存するとここに表示されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {visibleEntries.map((entry) => {
        const volume = calculateVolumeFromSets(entry.sets);
        const date = new Date(entry.recordedAt);
        const setsSummary =
          entry.sets.length > 0
            ? entry.sets
                .map((s) => `${s.weight}kg×${s.reps}`)
                .join(', ')
            : '—';

        return (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neon/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon">
                  {entry.muscleGroup}
                </span>
                <span className="text-[10px] text-muted/60">
                  {date.toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground/90">
                {entry.exerciseName}
              </span>
              <span className="text-xs text-muted">{setsSummary}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-lg font-bold text-foreground">
                {volume.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted/50">
                kg
              </span>
            </div>
          </div>
        );
      })}
      {hasLocked && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border border-dashed bg-surface/50 p-6">
          <Lock className="size-5 text-muted" />
          <span className="text-sm font-medium text-muted">Premiumでロック解除</span>
          <span className="text-xs text-muted/70">（1ヶ月より古い履歴を表示）</span>
        </div>
      )}
    </div>
  );
}
