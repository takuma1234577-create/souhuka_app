import { useMemo, useState } from 'react';
import { TrendingUp, Flame, Zap } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
  ReferenceDot,
} from 'recharts';
import { getWeeklyTrend, getWeeklyReport, getVolumeDiff, getVolumeByExercise } from '@/analysis';
import type { MuscleGroup } from '@/constants';
import { calculateVolumeFromSets } from '@/calculators';
import { getLogs, getLogsByMuscle } from '@/storage';
import { PaywallModal } from '@/components/PaywallModal';
import { presentPaywall } from '@/lib/revenuecat';

const CHIP_ORDER: (undefined | MuscleGroup)[] = [
  undefined,
  '胸',
  '背中',
  '脚',
  '肩',
  '上腕二頭筋',
  '上腕三頭筋',
  '腹筋',
  '前腕',
];

interface AnalyticsDashboardProps {
  isPremium: boolean;
  userId: string;
  onPremiumUpdate: () => void;
  onRestorePurchases: () => Promise<void>;
}

export function AnalyticsDashboard({ isPremium, userId, onPremiumUpdate, onRestorePurchases }: AnalyticsDashboardProps) {
  const [chartMuscle, setChartMuscle] = useState<undefined | MuscleGroup>(undefined);
  const [showPaywall, setShowPaywall] = useState(false);

  const weeklyReport = useMemo(() => getWeeklyReport(chartMuscle), [chartMuscle]);

  const chartData = useMemo(() => {
    const trend = getWeeklyTrend(chartMuscle);
    const rows = trend
      .slice()
      .reverse()
      .map((w) => ({
        name: w.weekStart.slice(5),
        volume: w.totalVolume,
        fullLabel: `${w.weekStart}〜${w.weekEnd}`,
      }));
    const maxVol = Math.max(0, ...rows.map((r) => r.volume));
    const bestIndex =
      maxVol > 0
        ? rows.reduce((last, r, i) => (r.volume === maxVol ? i : last), -1)
        : -1;
    return rows.map((r, i) => ({ ...r, isBest: i === bestIndex }));
  }, [chartMuscle]);

  const chartBestPoint = useMemo(() => chartData.find((d) => d.isBest), [chartData]);

  const lastSessionVolume = useMemo(() => {
    const logs = chartMuscle ? getLogsByMuscle(chartMuscle) : getLogs();
    const recent = logs[0];
    return recent ? calculateVolumeFromSets(recent.sets) : 0;
  }, [chartMuscle]);

  const prevSessionVolume = useMemo(() => {
    const logs = chartMuscle ? getLogsByMuscle(chartMuscle) : getLogs();
    const prev = logs[1];
    return prev ? calculateVolumeFromSets(prev.sets) : 0;
  }, [chartMuscle]);

  const volumeDiff = useMemo(() => {
    if (chartMuscle) return getVolumeDiff(lastSessionVolume, chartMuscle);
    if (prevSessionVolume === 0) return { noPreviousRecord: true, diffPercent: 0 };
    const diffPercent = Math.round(((lastSessionVolume - prevSessionVolume) / prevSessionVolume) * 1000) / 10;
    return { noPreviousRecord: false, diffPercent };
  }, [lastSessionVolume, prevSessionVolume, chartMuscle]);

  const vsPreviousPercent = volumeDiff.noPreviousRecord
    ? null
    : volumeDiff.diffPercent;

  const exerciseVolumes = useMemo(
    () => getVolumeByExercise(chartMuscle),
    [chartMuscle]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* 週次レポート */}
      <div className="rounded-2xl border border-neon/15 bg-surface p-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
          週次レポート
        </span>
        <p
          className={`mt-1 text-sm font-semibold ${
            weeklyReport.isIncrease ? 'text-neon' : 'text-muted'
          }`}
        >
          {weeklyReport.message}
        </p>
      </div>

      {/* vs Previous Session */}
      <div className="flex items-center justify-between rounded-2xl border border-neon/15 bg-surface p-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            前回セッション比
          </span>
          <div className="flex items-baseline gap-1.5">
            {vsPreviousPercent != null ? (
              <>
                <span
                  className={`font-mono text-3xl font-black ${
                    vsPreviousPercent >= 0 ? 'text-neon' : 'text-muted'
                  }`}
                >
                  {vsPreviousPercent >= 0 ? '+' : ''}
                  {vsPreviousPercent}%
                </span>
                <TrendingUp
                  className={`size-4 ${vsPreviousPercent >= 0 ? 'text-neon' : 'text-muted'}`}
                  strokeWidth={2.5}
                />
              </>
            ) : (
              <span className="font-mono text-lg text-muted">—</span>
            )}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10">
          <Flame className="size-6 text-neon" />
        </div>
      </div>

      {/* This Week / Sessions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-1.5">
            <Zap className="size-3 text-muted" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
              今週
            </span>
          </div>
          <span className="font-mono text-xl font-bold text-foreground">
            {weeklyReport.thisWeekVolume.toLocaleString()}
            <span className="ml-0.5 text-xs font-normal text-muted">kg</span>
          </span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-1.5">
            <Flame className="size-3 text-muted" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
              セッション数
            </span>
          </div>
          <span className="font-mono text-xl font-bold text-foreground">
            {chartData.reduce((s, w) => s + (w.volume > 0 ? 1 : 0), 0)}
            <span className="ml-0.5 text-xs font-normal text-muted">件</span>
          </span>
        </div>
      </div>

      {/* 筋肥大の軌跡（総負荷量推移） */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            筋肥大の軌跡（総負荷量推移）
          </span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {CHIP_ORDER.map((value) => {
            const label = value === undefined ? '全身' : value;
            const isActive =
              (value === undefined && chartMuscle === undefined) || value === chartMuscle;
            const isBodyPart = value !== undefined;
            const handleClick = () => {
              if (isBodyPart && !isPremium) {
                setShowPaywall(true);
                return;
              }
              setChartMuscle(value ?? undefined);
            };
            return (
              <button
                key={label}
                type="button"
                onClick={handleClick}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-neon text-background'
                    : 'bg-surface-raised text-muted hover:text-foreground'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {showPaywall && (
          <PaywallModal
            onClose={() => setShowPaywall(false)}
            onPurchaseComplete={onPremiumUpdate}
            onRestore={onRestorePurchases}
            userId={userId}
            presentPaywall={presentPaywall}
          />
        )}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ccff00" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ccff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fill: '#555', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#555', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141414',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  color: '#f0f0f0',
                  fontSize: '11px',
                }}
                formatter={(value: number) => [`${Number(value).toLocaleString()} kg`, '総負荷量']}
                labelStyle={{ color: '#666', fontSize: '10px' }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#ccff00"
                strokeWidth={2}
                fill="url(#volumeGradient)"
              >
                <LabelList
                  dataKey="volume"
                  position="top"
                  formatter={(v: number, _: string, props?: { payload?: { isBest?: boolean } }) =>
                    props?.payload?.isBest ? '👑 Best!' : ''
                  }
                />
              </Area>
              {chartBestPoint && chartBestPoint.volume > 0 && (
                <ReferenceDot
                  x={chartBestPoint.name}
                  y={chartBestPoint.volume}
                  r={5}
                  fill="#ccff00"
                  stroke="#0a0a0a"
                  strokeWidth={1}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 種目別総負荷量 */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
          種目別総負荷量
        </span>
        <p className="mt-0.5 text-[10px] text-muted/80">
          {chartMuscle ? `${chartMuscle}の種目` : '全身の種目'}（合計）
        </p>
        <div className="mt-3 flex max-h-64 flex-col gap-1.5 overflow-y-auto scrollbar-none">
          {exerciseVolumes.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">記録がありません</p>
          ) : (
            exerciseVolumes.map((row) => (
              <div
                key={chartMuscle ? row.exerciseName : `${row.muscleGroup}-${row.exerciseName}`}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-raised/50 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  {!chartMuscle && (
                    <span className="mr-1.5 inline-block rounded bg-neon/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-neon">
                      {row.muscleGroup}
                    </span>
                  )}
                  <span className="truncate text-sm font-medium text-foreground">
                    {row.exerciseName}
                  </span>
                  <span className="ml-1.5 text-[10px] text-muted">
                    {row.logCount}回
                  </span>
                </div>
                <span className="shrink-0 font-mono text-sm font-bold text-neon">
                  {row.totalVolume.toLocaleString()}
                  <span className="ml-0.5 text-[10px] font-normal text-muted">kg</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
