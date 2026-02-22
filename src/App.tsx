import React, { useState, useCallback, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WorkoutLogsProvider, useWorkoutLogsContext } from '@/contexts/WorkoutLogsContext';
import { MuscleGroupTabs } from '@/components/MuscleGroupTabs';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { NumericInputCard } from '@/components/NumericInputCard';
import { VolumeDisplay } from '@/components/VolumeDisplay';
import { BottomNav, type NavTab } from '@/components/BottomNav';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { HistoryView } from '@/components/HistoryView';
import { SettingsView } from '@/components/SettingsView';
import { LoginView } from '@/components/LoginView';
import { MUSCLE_GROUPS, EXERCISE_NAMES } from '@/constants';
import type { MuscleGroup } from '@/constants';
import { calculate1RM } from '@/calculators';
import { checkPersonalBest } from '@/analysis';
import { getLastSuggestedInputs } from '@/placeholderLog';
import type { WorkoutLog } from '@/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRevenueCatSync } from '@/hooks/useRevenueCatSync';
import { getDefaultIncrement, getWeightUnit } from '@/settings';

const FAVORITES_KEY = 'souhuka-favorites';

function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  } catch {
    /* ignore */
  }
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { saveLog } = useWorkoutLogsContext();
  const { profile, setPremium } = useUserProfile(user?.uid ?? null);
  useRevenueCatSync(user);

  const [activeTab, setActiveTab] = useState<NavTab>('calculator');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('胸');
  const [exercise, setExercise] = useState<string>(EXERCISE_NAMES['胸'][0] ?? '');
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showPbToast, setShowPbToast] = useState(false);
  const [btnGlow, setBtnGlow] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const isPremium = profile?.isPremium ?? false;
  const exercises = EXERCISE_NAMES[muscleGroup] ?? [];

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const handleMuscleGroupChange = useCallback(
    (group: MuscleGroup) => {
      setMuscleGroup(group);
      const list = EXERCISE_NAMES[group] ?? [];
      const sorted = [...list].sort((a, b) => {
        const aFav = favorites.has(a);
        const bFav = favorites.has(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.localeCompare(b);
      });
      setExercise(sorted[0] ? String(sorted[0]) : '');
    },
    [favorites]
  );

  const handleToggleFavorite = useCallback((ex: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(ex)) next.delete(ex);
      else next.add(ex);
      saveFavorites(next);
      return next;
    });
  }, []);

  const totalVolume = weight * reps * sets;
  const estimated1RM =
    weight > 0 && reps > 0 ? calculate1RM(weight, reps) : null;

  const fireConfetti = useCallback(() => {
    const count = 80;
    const defaults = {
      origin: { y: 0.6 },
      colors: ['#ccff00', '#99cc00', '#7fff00'],
    };
    function fire(
      particleRatio: number,
      opts: { spread?: number; startVelocity?: number; decay?: number; scalar?: number }
    ) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  }, []);

  const handleSave = useCallback(() => {
    if (!exercise.trim() || weight <= 0 || reps <= 0 || sets <= 0) return;

    const volume = totalVolume;
    const pb = checkPersonalBest(muscleGroup, volume, exercise.trim());

    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      muscleGroup,
      exerciseName: exercise.trim(),
      sets: Array.from({ length: sets }, () => ({ weight, reps })),
      recordedAt: new Date().toISOString(),
    };
    saveLog(log);

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);

    if (pb.isPersonalBest) {
      setShowPbToast(true);
      setTimeout(() => setShowPbToast(false), 3000);
      fireConfetti();
      setBtnGlow(true);
      setTimeout(() => setBtnGlow(false), 2500);
    }
  }, [muscleGroup, exercise, weight, reps, sets, totalVolume, fireConfetti]);

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-muted">読み込み中...</div>
      </div>
    );
  }
  if (!user) {
    return <LoginView />;
  }

  const lastSuggested = getLastSuggestedInputs(muscleGroup, exercise || undefined);
  const weightUnit = getWeightUnit();
  const defaultIncrement = getDefaultIncrement();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-5 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-[0_0_12px_rgba(204,255,0,0.2)]">
            <img src="/icon.png" alt="" className="size-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">
              総負荷量トラック
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">
              筋肥大・ボリューム管理
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-24 pt-5">
        {activeTab === 'calculator' && (
          <div className="flex flex-col gap-4">
            <MuscleGroupTabs selected={muscleGroup} onSelect={handleMuscleGroupChange} />

            <ExerciseSelector
              muscleGroup={muscleGroup}
              selected={exercise}
              onSelect={setExercise}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            <div className="grid grid-cols-3 gap-2.5">
              <NumericInputCard
                label="重量"
                unit={weightUnit}
                value={weight}
                step={defaultIncrement}
                min={0}
                max={500}
                onChange={setWeight}
              />
              <NumericInputCard
                label="レップ"
                value={reps}
                step={1}
                min={1}
                max={100}
                onChange={setReps}
              />
              <NumericInputCard
                label="セット"
                value={sets}
                step={1}
                min={1}
                max={50}
                onChange={setSets}
              />
            </div>
            {lastSuggested && (
              <p className="text-[10px] text-neon/80">
                前回の自分: {lastSuggested.weight}kg × {lastSuggested.reps}rep ×{' '}
                {lastSuggested.sets}セット
              </p>
            )}

            <VolumeDisplay volume={totalVolume} />

            {estimated1RM != null && estimated1RM > 0 && (
              <p className="text-center text-xs text-muted">
                推定1RM: <span className="font-mono font-semibold text-neon/90">{estimated1RM} kg</span>
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saved || !exercise.trim()}
              className={`btn-save flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-all active:scale-[0.97] ${
                saved
                  ? 'bg-neon/15 text-neon'
                  : 'bg-neon text-background shadow-[0_0_24px_rgba(204,255,0,0.2)] hover:shadow-[0_0_32px_rgba(204,255,0,0.35)]'
              } ${btnGlow ? 'glow' : ''}`}
            >
              {saved ? (
                <>
                  <Check className="size-4" strokeWidth={3} />
                  保存しました
                </>
              ) : (
                <>
                  <Save className="size-4" strokeWidth={2.5} />
                  記録する
                </>
              )}
            </button>

            <div className="mt-3">
              <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                分析
              </h2>
              <AnalyticsDashboard
                isPremium={isPremium}
                userId={user.uid}
                onPremiumUpdate={() => setPremium(true)}
                onRestorePurchases={async () => {
                  const { getCustomerInfo, ensureRevenueCatUser } = await import('@/lib/revenuecat');
                  ensureRevenueCatUser(user.uid);
                  const { isPremium: rcPremium } = await getCustomerInfo(user.uid);
                  await setPremium(rcPremium);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              トレーニング履歴
            </h2>
            <HistoryView isPremium={isPremium} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              設定
            </h2>
            <SettingsView
              userEmail={user.email ?? undefined}
              onRestorePurchases={async () => {
                const { getCustomerInfo, ensureRevenueCatUser } = await import('@/lib/revenuecat');
                ensureRevenueCatUser(user.uid);
                const { isPremium: rcPremium } = await getCustomerInfo(user.uid);
                await setPremium(rcPremium);
              }}
            />
          </div>
        )}
      </main>

      {showPbToast && (
        <div className="pb-toast" role="alert">
          <span className="text-xl" aria-hidden>👑</span>
          <span>自己ベスト更新！</span>
        </div>
      )}

      <BottomNav active={activeTab} onNavigate={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkoutLogsProvider>
        <AppContent />
      </WorkoutLogsProvider>
    </AuthProvider>
  );
}
