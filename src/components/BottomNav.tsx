import { Calculator, ClipboardList, Settings } from 'lucide-react';

export type NavTab = 'calculator' | 'history' | 'settings';

interface BottomNavProps {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}

const ITEMS: { id: NavTab; label: string; icon: typeof Calculator }[] = [
  { id: 'calculator', label: '記録', icon: Calculator },
  { id: 'history', label: '履歴', icon: ClipboardList },
  { id: 'settings', label: '設定', icon: Settings },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      aria-label="メインメニュー"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-md items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-0.5 px-6 py-1.5 transition-colors ${
                isActive
                  ? 'text-neon'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -top-2 h-0.5 w-6 rounded-full bg-neon shadow-[0_0_8px_rgba(204,255,0,0.5)]"
                />
              )}
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
