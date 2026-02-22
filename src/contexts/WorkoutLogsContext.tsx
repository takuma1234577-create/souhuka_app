import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { saveLog as saveLogLocal, getLogs, getLocalStorageLogsOnly, setLogsOverride, deleteLog as deleteLogLocal } from '@/storage';
import { saveWorkoutLog, deleteWorkoutLog } from '@/lib/firestore';
import type { WorkoutLog } from '@/types';

interface WorkoutLogsContextValue {
  logs: WorkoutLog[];
  loading: boolean;
  saveLog: (log: WorkoutLog) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
}

const WorkoutLogsContext = createContext<WorkoutLogsContextValue | null>(null);

export function WorkoutLogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const { logs: firestoreLogs, loading: firestoreLoading } = useWorkoutLogs(uid);
  const [localLogs, setLocalLogs] = useState<WorkoutLog[]>(() => getLocalStorageLogsOnly());

  useEffect(() => {
    if (!uid) setLocalLogs(getLocalStorageLogsOnly());
  }, [uid]);

  const saveLog = useCallback(
    async (log: WorkoutLog) => {
      const toSave = { ...log, recordedAt: log.recordedAt || new Date().toISOString() };
      if (uid) {
        await saveWorkoutLog(uid, toSave);
      } else {
        saveLogLocal(toSave);
        setLocalLogs(getLogs());
      }
    },
    [uid]
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      if (uid) {
        await deleteWorkoutLog(uid, logId);
      } else {
        deleteLogLocal(logId);
        setLocalLogs(getLogs());
      }
    },
    [uid]
  );

  const logs = uid ? firestoreLogs : localLogs;
  const loading = uid ? firestoreLoading : false;

  useEffect(() => {
    setLogsOverride(uid ? logs : null);
    return () => setLogsOverride(null);
  }, [uid, logs]);

  const value: WorkoutLogsContextValue = { logs, loading, saveLog, deleteLog };

  return (
    <WorkoutLogsContext.Provider value={value}>
      {children}
    </WorkoutLogsContext.Provider>
  );
}

export function useWorkoutLogsContext() {
  const ctx = useContext(WorkoutLogsContext);
  if (!ctx) throw new Error('useWorkoutLogsContext must be used within WorkoutLogsProvider');
  return ctx;
}
