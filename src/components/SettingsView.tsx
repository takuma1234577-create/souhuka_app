import { useState } from 'react';
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { signOut } from '@/lib/auth';

const SETTINGS_ITEMS: { label: string; value: string; icon: LucideIcon }[] = [
  { label: '重量単位', value: 'kg', icon: Weight },
  { label: 'デフォルト増減', value: '2.5 kg', icon: Ruler },
  { label: 'レストタイマー', value: '90秒', icon: Timer },
  { label: 'データエクスポート', value: '', icon: Download },
  { label: 'このアプリについて', value: 'v1.0', icon: Info },
];

interface SettingsViewProps {
  userEmail?: string;
  onRestorePurchases: () => Promise<void>;
}

export function SettingsView({ userEmail, onRestorePurchases }: SettingsViewProps) {
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

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
        {SETTINGS_ITEMS.map((item, i) => (
          <button
            key={item.label}
            type="button"
            className={`flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-raised ${
              i < SETTINGS_ITEMS.length - 1 ? 'border-b border-border' : ''
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
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-medium text-foreground hover:bg-surface-raised disabled:opacity-50"
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
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="size-4" />
          ログアウト
        </button>
      </div>
    </div>
  );
}
