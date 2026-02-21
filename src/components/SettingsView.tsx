import { useState, useEffect } from 'react';
import {
  ChevronRight,
  Weight,
  Ruler,
  Timer,
  Download,
  Info,
  LogOut,
  RotateCcw,
  Loader2,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { signOut } from '@/lib/auth';
import {
  getSettings,
  setSettings,
  type AppSettings,
  type WeightUnit,
  type DefaultIncrement,
} from '@/settings';
import { getLogs } from '@/storage';

interface SettingsViewProps {
  userEmail?: string;
  onRestorePurchases: () => Promise<void>;
}

type ModalKind = null | 'weight' | 'increment' | 'rest' | 'about';

const REST_OPTIONS = [60, 90, 120, 180] as const;
const INCREMENT_OPTIONS: DefaultIncrement[] = [1, 2.5, 5];

export function SettingsView({ userEmail, onRestorePurchases }: SettingsViewProps) {
  const [settings, setSettingsState] = useState<AppSettings>(() => getSettings());
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);

  useEffect(() => {
    setSettingsState(getSettings());
  }, [modal]);

  const handleRestore = async () => {
    setRestoring(true);
    setRestoreMessage(null);
    try {
      await onRestorePurchases();
      setRestoreMessage('購入情報を復元しました');
    } catch {
      setRestoreMessage('復元に失敗しました');
    } finally {
      setRestoring(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = setSettings({ [key]: value });
    setSettingsState(next);
    setModal(null);
  };

  const handleExport = () => {
    const logs = getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `souhuka_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setModal(null);
  };

  const items: { id: ModalKind; label: string; value: string; icon: LucideIcon }[] = [
    { id: 'weight', label: '重量単位', value: settings.weightUnit === 'lb' ? 'lb' : 'kg', icon: Weight },
    {
      id: 'increment',
      label: 'デフォルト増減',
      value: `${settings.defaultIncrement} kg`,
      icon: Ruler,
    },
    {
      id: 'rest',
      label: 'レストタイマー',
      value: `${settings.restTimerSeconds}秒`,
      icon: Timer,
    },
    { id: null, label: 'データエクスポート', value: '', icon: Download },
    { id: 'about', label: 'このアプリについて', value: 'v1.0', icon: Info },
  ];

  return (
    <div className="flex flex-col gap-4">
      {userEmail && (
        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            ログイン中
          </p>
          <p className="mt-0.5 truncate text-sm text-foreground">{userEmail}</p>
        </div>
      )}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.id === null && item.label === 'データエクスポート') {
                handleExport();
                return;
              }
              setModal(item.id);
            }}
            className={`flex items-center gap-3 px-4 py-4 text-left transition-colors active:bg-surface-raised ${
              i < items.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
              <item.icon className="size-4 text-muted" />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">
              {item.label}
            </span>
            <div className="flex items-center gap-1">
              {item.value && (
                <span className="font-mono text-xs text-muted">{item.value}</span>
              )}
              <ChevronRight className="size-4 text-muted/30" />
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleRestore}
          disabled={restoring}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-medium text-foreground active:bg-surface-raised disabled:opacity-50"
        >
          {restoring ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RotateCcw className="size-4" />
          )}
          購入の復元（Restore Purchases）
        </button>
        {restoreMessage && (
          <p className="text-center text-xs text-muted">{restoreMessage}</p>
        )}
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3.5 text-sm font-medium text-red-400 active:bg-red-500/10"
        >
          <LogOut className="size-4" />
          ログアウト
        </button>
      </div>

      {/* モーダル */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl border border-border bg-surface p-6 pb-10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {modal === 'weight' && '重量単位'}
                {modal === 'increment' && 'デフォルト増減'}
                {modal === 'rest' && 'レストタイマー'}
                {modal === 'about' && 'このアプリについて'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg p-1 text-muted active:bg-surface-raised"
                aria-label="閉じる"
              >
                <X className="size-5" />
              </button>
            </div>

            {modal === 'weight' && (
              <div className="flex gap-3">
                {(['kg', 'lb'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => updateSetting('weightUnit', unit as WeightUnit)}
                    className={`flex-1 rounded-xl border py-3 text-sm font-semibold ${
                      settings.weightUnit === unit
                        ? 'border-neon bg-neon/15 text-neon'
                        : 'border-border bg-surface-raised text-foreground'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            )}

            {modal === 'increment' && (
              <div className="flex flex-col gap-2">
                {INCREMENT_OPTIONS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateSetting('defaultIncrement', val)}
                    className={`rounded-xl border py-3 text-sm font-semibold ${
                      settings.defaultIncrement === val
                        ? 'border-neon bg-neon/15 text-neon'
                        : 'border-border bg-surface-raised text-foreground'
                    }`}
                  >
                    {val} kg
                  </button>
                ))}
              </div>
            )}

            {modal === 'rest' && (
              <div className="flex flex-col gap-2">
                {REST_OPTIONS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => updateSetting('restTimerSeconds', sec)}
                    className={`rounded-xl border py-3 text-sm font-semibold ${
                      settings.restTimerSeconds === sec
                        ? 'border-neon bg-neon/15 text-neon'
                        : 'border-border bg-surface-raised text-foreground'
                    }`}
                  >
                    {sec}秒
                  </button>
                ))}
              </div>
            )}

            {modal === 'about' && (
              <div className="space-y-3 text-sm text-muted">
                <p>総負荷量トラック v1.0</p>
                <p>筋トレの総負荷量（ボリューム）を記録し、筋肥大の軌跡を可視化するアプリです。</p>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="mt-4 w-full rounded-xl bg-neon/15 py-3 text-sm font-semibold text-neon"
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
