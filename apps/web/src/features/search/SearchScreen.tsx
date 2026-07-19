import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function SearchScreen() {
  return (
    <EmptyState
      eyebrow="Search"
      title="Client-side search comes next."
      description="Fuse.js over a local catalog index (ADR-010) — offline-first, no third-party runtime dependency. This route is ready for that milestone."
      action={<TextLink to="/products">Browse products</TextLink>}
    />
  );
}
