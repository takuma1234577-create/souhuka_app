import { ChevronRight, Weight, Ruler, Timer, Download, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const SETTINGS_ITEMS: { label: string; value: string; icon: LucideIcon }[] = [
  { label: '重量単位', value: 'kg', icon: Weight },
  { label: 'デフォルト増減', value: '2.5 kg', icon: Ruler },
  { label: 'レストタイマー', value: '90秒', icon: Timer },
  { label: 'データエクスポート', value: '', icon: Download },
  { label: 'このアプリについて', value: 'v1.0', icon: Info },
];

export function SettingsView() {
  return (
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
  );
}
