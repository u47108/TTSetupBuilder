import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

/** Photography-first empty surface — honest debt, not retail filler. */
export function EmptyState({ eyebrow, title, description, action }: EmptyStateProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
      <div className="space-y-4">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-[var(--color-text-secondary)]">
          {description}
        </p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>

      <motion.div
        initial={{ opacity: 0.4, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)]"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgb(45_212_191_/_0.08),transparent_42%),radial-gradient(circle_at_70%_30%,rgb(255_255_255_/_0.06),transparent_50%)]" />
        <div className="absolute inset-6 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-media-placeholder)]/40" />
        <p className="absolute bottom-5 left-5 text-xs uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
          Photo stage · awaiting owned assets
        </p>
      </motion.div>
    </section>
  );
}
