import { useState } from 'react';
import { X, Crown, Loader2 } from 'lucide-react';

interface PaywallModalProps {
  onClose: () => void;
  onPurchaseComplete: () => void;
  userId: string;
  presentPaywall: (userId: string) => Promise<{ isPremium: boolean } | null>;
}

export function PaywallModal({
  onClose,
  onPurchaseComplete,
  userId,
  presentPaywall,
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const result = await presentPaywall(userId);
      if (result?.isPremium) {
        onPurchaseComplete();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-neon" />
            <span className="font-bold text-foreground">Premium</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface-raised hover:text-foreground"
            aria-label="閉じる"
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-4 text-sm text-muted">
          部位別グラフの閲覧や、1ヶ月を超える履歴を見るには Premium が必要です。
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handlePurchase}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-neon py-3.5 text-sm font-bold text-background disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              '購入画面を開く'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 text-sm text-muted underline hover:text-foreground"
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  );
}
