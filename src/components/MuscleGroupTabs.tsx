import type { MuscleGroup } from '@/constants';

const MUSCLE_GROUPS: MuscleGroup[] = [
  '胸',
  '背中',
  '脚',
  '肩',
  '上腕二頭筋',
  '上腕三頭筋',
  '腹筋',
  '前腕',
];

interface MuscleGroupTabsProps {
  selected: MuscleGroup;
  onSelect: (group: MuscleGroup) => void;
}

export function MuscleGroupTabs({ selected, onSelect }: MuscleGroupTabsProps) {
  return (
    <nav
      aria-label="部位選択"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {MUSCLE_GROUPS.map((group) => {
        const isActive = group === selected;
        return (
          <button
            key={group}
            type="button"
            onClick={() => onSelect(group)}
            aria-pressed={isActive}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-wider transition-all ${
              isActive
                ? 'bg-neon text-background shadow-[0_0_16px_rgba(204,255,0,0.25)]'
                : 'bg-surface-raised text-muted hover:text-foreground border border-border'
            }`}
          >
            {group}
          </button>
        );
      })}
    </nav>
  );
}
