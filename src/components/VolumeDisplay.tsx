interface VolumeDisplayProps {
  volume: number;
}

export function VolumeDisplay({ volume }: VolumeDisplayProps) {
  const formatted = volume.toLocaleString();

  return (
    <div className="relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl border border-neon/20 bg-surface py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,0.06)_0%,transparent_70%)]"
      />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        総負荷量（ボリューム）
      </span>
      <div className="relative flex items-baseline gap-1.5">
        <span className="font-mono text-5xl font-black tabular-nums leading-none text-neon drop-shadow-[0_0_20px_rgba(204,255,0,0.3)]">
          {formatted}
        </span>
        <span className="text-base font-semibold text-neon-dim">kg</span>
      </div>
      <span className="text-[10px] text-muted/50">重量 × レップ × セット数</span>
    </div>
  );
}
