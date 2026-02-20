import { useEffect } from 'react';
import { ensureRevenueCatUser, getCustomerInfo } from '@/lib/revenuecat';
import { setUserProfile } from '@/lib/firestore';
import type { AuthUser } from '@/lib/auth';

/** ログイン時に RevenueCat を configure し、Entitlements を Firestore isPremium に同期。ユーザー属性も作成・更新。 */
export function useRevenueCatSync(user: AuthUser | null): void {
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let cancelled = false;
    (async () => {
      ensureRevenueCatUser(uid);
      if (cancelled) return;
      const { isPremium } = await getCustomerInfo(uid);
      if (cancelled) return;
      await setUserProfile(uid, {
        email: user.email ?? undefined,
        displayName: user.displayName ?? undefined,
        isPremium,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.email, user?.displayName]);
}
