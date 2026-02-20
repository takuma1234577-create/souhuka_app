import { useEffect, useState } from 'react';
import { subscribeWorkoutLogs, getWorkoutLogs, setWorkoutLogs } from '@/lib/firestore';
import { getLogs } from '@/storage';
import type { WorkoutLog } from '@/types';

const MIGRATION_KEY = 'souhuka_migrated_to_firestore';

export function useWorkoutLogs(uid: string | null): {
  logs: WorkoutLog[];
  loading: boolean;
  setLogs: (logs: WorkoutLog[]) => Promise<void>;
} {
  const [logs, setLogsState] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(!!uid);

  useEffect(() => {
    if (!uid) {
      setLogsState(getLogs());
      setLoading(false);
      return;
    }
    setLoading(true);
    const migrateOnce = async () => {
      const migrated = localStorage.getItem(MIGRATION_KEY);
      if (migrated === uid) return;
      const localLogs = getLogs();
      if (localLogs.length > 0) {
        await setWorkoutLogs(uid, localLogs);
        localStorage.setItem(MIGRATION_KEY, uid);
      }
    };
    migrateOnce().then(() => {
      const unsubscribe = subscribeWorkoutLogs(uid, (next) => {
        setLogsState(next);
        setLoading(false);
      });
      return () => unsubscribe();
    });
  }, [uid]);

  const setLogs = async (next: WorkoutLog[]) => {
    if (!uid) return;
    await setWorkoutLogs(uid, next);
  };

  return { logs, loading, setLogs };
}
