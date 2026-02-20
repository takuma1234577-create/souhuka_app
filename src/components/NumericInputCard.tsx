import { Minus, Plus } from 'lucide-react';

interface NumericInputCardProps {
  label: string;
  value: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function NumericInputCard({
  label,
  value,
  unit,
  step = 1,
  min = 0,
  max = 9999,
  onChange,
}: NumericInputCardProps) {
  const increment = () => onChange(Math.min(value + step, max));
  const decrement = () => onChange(Math.max(value - step, min));

  const display = step % 1 !== 0 ? value.toFixed(1) : String(value);

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
        {label}
        {unit && <span className="ml-0.5 text-muted/50">({unit})</span>}
      </span>
      <span className="font-mono text-3xl font-black tabular-nums leading-none text-foreground">
        {display}
      </span>
      <div className="flex w-full items-center gap-1.5">
        <button
          type="button"
          onClick={decrement}
          aria-label={`${label}を減らす`}
          className="flex h-9 flex-1 items-center justify-center rounded-lg bg-surface-raised text-muted transition-colors hover:bg-border hover:text-foreground active:scale-95"
        >
          <Minus className="size-3.5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={increment}
          aria-label={`${label}を増やす`}
          className="flex h-9 flex-1 items-center justify-center rounded-lg bg-surface-raised text-muted transition-colors hover:bg-border hover:text-foreground active:scale-95"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
