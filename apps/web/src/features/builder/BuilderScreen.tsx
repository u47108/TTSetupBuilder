import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function BuilderScreen() {
  return (
    <EmptyState
      eyebrow="Builder"
      title="Racket = Blade + FH + BH."
      description="Compose dynamically from catalog parts (ADR-011). Assembled racket imagery is generated in UI — not stored as inventory photos."
      action={<TextLink to="/">Back to explore</TextLink>}
    />
  );
}
