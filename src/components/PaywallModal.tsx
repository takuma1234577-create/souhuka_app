import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { PaywallView, type PlanId } from '@/components/PaywallView';

interface PaywallModalProps {
  onClose: () => void;
  onPurchaseComplete: () => void;
  onRestore: () => Promise<void>;
  userId: string;
  presentPaywall: (userId: string) => Promise<{ isPremium: boolean } | null>;
}

export function PaywallModal({
  onClose,
  onPurchaseComplete,
  onRestore,
  userId,
  presentPaywall,
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (_planId: PlanId) => {
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

  const handleRestore = async () => {
    setLoading(true);
    try {
      await onRestore();
      onClose();
    } catch {
      /* restore failed, stay on paywall */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-sm flex-col rounded-2xl border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-end border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-surface-raised hover:text-foreground"
            aria-label="閉じる"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <Loader2 className="size-10 animate-spin text-neon" />
              <p className="text-sm text-muted">処理中...</p>
            </div>
          ) : (
            <PaywallView
              onSelectPlan={handleSelectPlan}
              onRestore={handleRestore}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
