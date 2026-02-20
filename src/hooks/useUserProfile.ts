import { useEffect, useState } from 'react';
import { subscribeUserProfile, setUserProfile } from '@/lib/firestore';
import type { UserProfile } from '@/lib/firestore';

export function useUserProfile(uid: string | null): {
  profile: UserProfile | null;
  loading: boolean;
  setPremium: (isPremium: boolean) => Promise<void>;
} {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(!!uid);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeUserProfile(uid, (p) => {
      setProfile(p);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const setPremium = async (isPremium: boolean) => {
    if (!uid) return;
    await setUserProfile(uid, { isPremium });
  };

  return { profile, loading, setPremium };
}
