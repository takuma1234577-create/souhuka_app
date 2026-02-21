import { useState, useMemo, useEffect } from 'react';
import { Star, Search } from 'lucide-react';
import { EXERCISE_NAMES } from '@/constants';
import type { MuscleGroup } from '@/constants';

interface ExerciseSelectorProps {
  muscleGroup: MuscleGroup;
  selected: string;
  onSelect: (exercise: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (exercise: string) => void;
}

export function ExerciseSelector({
  muscleGroup,
  selected,
  onSelect,
  favorites,
  onToggleFavorite,
}: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery('');
  }, [muscleGroup]);

  const exercises = EXERCISE_NAMES[muscleGroup] ?? [];

  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = query
      ? exercises.filter((ex) => ex.toLowerCase().includes(query))
      : [...exercises];
    list.sort((a, b) => {
      const aFav = favorites.has(a);
      const bFav = favorites.has(b);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.localeCompare(b);
    });
    return list;
  }, [exercises, searchQuery, favorites]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
        種目
      </span>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="種目を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-neon focus:outline-none"
          aria-label="種目を絞り込み検索"
        />
      </div>
      <div className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-2xl border border-border bg-surface p-2 scrollbar-none">
        {filteredAndSorted.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted">該当する種目がありません</p>
        ) : (
          filteredAndSorted.map((exercise) => {
            const isActive = exercise === selected;
            const isFav = favorites.has(exercise);
            return (
              <div
                key={exercise}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all ${
                  isActive
                    ? 'bg-neon/10 ring-1 ring-neon/30'
                    : 'hover:bg-surface-raised'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(exercise)}
                  className="flex flex-1 items-center gap-2.5 text-left"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
                      isActive
                        ? 'bg-neon shadow-[0_0_6px_rgba(204,255,0,0.5)]'
                        : 'bg-muted/20'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-neon' : 'text-foreground/80'
                    }`}
                  >
                    {exercise}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(exercise);
                  }}
                  aria-label={isFav ? `${exercise}をお気に入りから削除` : `${exercise}をお気に入りに追加`}
                  className="shrink-0 p-1 transition-all active:scale-90"
                >
                  <Star
                    className={`size-4 transition-colors ${
                      isFav
                        ? 'fill-neon text-neon drop-shadow-[0_0_4px_rgba(204,255,0,0.4)]'
                        : 'text-muted/30 hover:text-muted/60'
                    }`}
                    strokeWidth={isFav ? 2.5 : 1.5}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
