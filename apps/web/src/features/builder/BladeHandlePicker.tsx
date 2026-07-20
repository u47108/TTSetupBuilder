import type { BladeHandleType } from '@ttsetupbuilder/types';
import { cn } from '@/shared/lib/cn';

const HANDLE_LABELS: Record<BladeHandleType, string> = {
  FL: 'FL · Acampanada',
  ST: 'ST · Recta',
  AN: 'AN · Anatómica',
  CS: 'CS · Chinese',
};

type BladeHandlePickerProps = {
  available: BladeHandleType[];
  selected: BladeHandleType | null;
  onSelect: (handle: BladeHandleType) => void;
};

/** Classic blades: Tomada FL / ST (and others when present). */
export function BladeHandlePicker({ available, selected, onSelect }: BladeHandlePickerProps) {
  const options = available.length > 0 ? available : (['FL', 'ST'] as BladeHandleType[]);

  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] p-4">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
          2 · Tomada del madero
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Clasificación clásica: FL (flared / acampanada) o ST (straight / recta).
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((handle) => {
          const isSelected = selected === handle;
          return (
            <button
              key={handle}
              type="button"
              onClick={() => onSelect(handle)}
              className={cn(
                'rounded-xl border px-4 py-2.5 text-sm transition-colors',
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border-subtle)] bg-[var(--color-canvas)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              )}
            >
              {HANDLE_LABELS[handle]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
