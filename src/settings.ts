/**
 * アプリ設定の永続化（LocalStorage）
 */
const KEY = 'souhuka_settings';

export type WeightUnit = 'kg' | 'lb';
export type DefaultIncrement = 1 | 2.5 | 5;

export interface AppSettings {
  weightUnit: WeightUnit;
  defaultIncrement: DefaultIncrement;
  restTimerSeconds: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  weightUnit: 'kg',
  defaultIncrement: 2.5,
  restTimerSeconds: 90,
};

function load(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      weightUnit: parsed.weightUnit === 'lb' ? 'lb' : 'kg',
      defaultIncrement: [1, 2.5, 5].includes(Number(parsed.defaultIncrement))
        ? (parsed.defaultIncrement as DefaultIncrement)
        : 2.5,
      restTimerSeconds: typeof parsed.restTimerSeconds === 'number'
        ? Math.max(30, Math.min(300, parsed.restTimerSeconds))
        : 90,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

let cached: AppSettings | null = null;

export function getSettings(): AppSettings {
  if (!cached) cached = load();
  return cached;
}

export function setSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...partial };
  cached = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function getWeightUnit(): WeightUnit {
  return getSettings().weightUnit;
}

export function getDefaultIncrement(): DefaultIncrement {
  return getSettings().defaultIncrement;
}

export function getRestTimerSeconds(): number {
  return getSettings().restTimerSeconds;
}
