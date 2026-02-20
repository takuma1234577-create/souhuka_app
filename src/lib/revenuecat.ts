import { Purchases } from '@revenuecat/purchases-js';

const API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;
let instance: Purchases | null = null;

const ENTITLEMENT_ID = 'premium';

function getOrCreateInstance(appUserId: string): Purchases | null {
  if (!API_KEY) return null;
  try {
    if (instance) {
      if (instance.getAppUserId() !== appUserId) {
        void instance.changeUser(appUserId);
      }
      return instance;
    }
    instance = Purchases.configure(API_KEY, appUserId);
    return instance;
  } catch {
    return null;
  }
}

export async function ensureRevenueCatUser(appUserId: string): Promise<void> {
  getOrCreateInstance(appUserId);
}

export async function getCustomerInfo(appUserId: string): Promise<{ isPremium: boolean }> {
  const purchases = getOrCreateInstance(appUserId);
  if (!purchases) return { isPremium: false };
  try {
    const customerInfo = await purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
    return { isPremium };
  } catch {
    return { isPremium: false };
  }
}

/** 購入の復元: 最新の CustomerInfo を取得して Entitlements を反映する */
export async function restorePurchases(appUserId: string): Promise<{ isPremium: boolean }> {
  const purchases = getOrCreateInstance(appUserId);
  if (!purchases) return { isPremium: false };
  try {
    const customerInfo = await purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
    return { isPremium };
  } catch {
    return { isPremium: false };
  }
}

/** ペイウォール（購入画面）を表示する */
export async function presentPaywall(appUserId: string): Promise<{ isPremium: boolean } | null> {
  const purchases = getOrCreateInstance(appUserId);
  if (!purchases) return null;
  try {
    const result = await purchases.presentPaywall({});
    const isPremium = result.customerInfo.entitlements.active[ENTITLEMENT_ID] != null;
    return { isPremium };
  } catch {
    return null;
  }
}
