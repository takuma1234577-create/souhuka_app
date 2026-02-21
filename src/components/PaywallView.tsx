import { Crown, BarChart3, Cloud, Ban } from 'lucide-react';
import { PAYWALL_LINKS } from '@/constants';

export type PlanId = 'monthly' | 'yearly' | 'lifetime';

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  sublabel?: string;
  badge?: string;
}[] = [
  { id: 'monthly', name: '月額', price: '480円', sublabel: '/月' },
  {
    id: 'yearly',
    name: '年額',
    price: '2,800円',
    sublabel: '月換算 約233円・一番お得',
    badge: '人気No.1',
  },
  { id: 'lifetime', name: '買い切り', price: '4,900円', sublabel: '永久利用' },
];

const FEATURES: { icon: typeof BarChart3; text: string }[] = [
  { icon: BarChart3, text: '部位別・種目別グラフ解放' },
  { icon: Cloud, text: 'クラウド保存' },
  { icon: Ban, text: '広告非表示' },
];

interface PaywallViewProps {
  onSelectPlan: (planId: PlanId) => void;
  onRestore: () => void;
  loading?: boolean;
}

export function PaywallView({
  onSelectPlan,
  onRestore,
  loading = false,
}: PaywallViewProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center gap-2 py-2">
        <Crown className="size-6 text-neon" />
        <span className="text-lg font-black uppercase tracking-wider text-foreground">
          Premium
        </span>
      </div>

      <p className="mt-4 text-center text-base font-bold leading-snug text-foreground">
        プロテイン1本分で、
        <br />
        あなたの筋肥大を可視化する
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 rounded-xl bg-surface-raised/50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neon/15">
              <Icon className="size-4 text-neon" />
            </div>
            <span className="text-sm font-medium text-foreground">{text}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-wider text-muted">
        プランを選択
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            disabled={loading}
            onClick={() => onSelectPlan(plan.id)}
            className="relative flex items-center justify-between rounded-xl border-2 border-border bg-surface px-4 py-3.5 text-left transition-all active:scale-[0.99] disabled:opacity-50 data-[highlight]:border-neon data-[highlight]:bg-neon/5"
            data-highlight={plan.badge ? true : undefined}
          >
            {plan.badge && (
              <span className="absolute -top-2 left-3 rounded-full bg-neon px-2 py-0.5 text-[10px] font-bold text-background">
                {plan.badge}
              </span>
            )}
            <div>
              <span className="text-sm font-bold text-foreground">{plan.name}</span>
              {plan.sublabel && (
                <span className="ml-2 text-xs text-muted">{plan.sublabel}</span>
              )}
            </div>
            <span className="font-mono text-lg font-black text-neon">{plan.price}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-muted">
        年額は月額より約51%お得です
      </p>

      <nav className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6">
        <a
          href={PAYWALL_LINKS.TERMS_OF_USE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted underline hover:text-foreground"
        >
          利用規約
        </a>
        <a
          href={PAYWALL_LINKS.PRIVACY_POLICY}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted underline hover:text-foreground"
        >
          プライバシーポリシー
        </a>
        <button
          type="button"
          onClick={onRestore}
          disabled={loading}
          className="text-xs text-muted underline hover:text-foreground disabled:opacity-50"
        >
          購入の復元
        </button>
      </nav>
    </div>
  );
}
