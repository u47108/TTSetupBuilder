import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function ProductsScreen() {
  return (
    <EmptyState
      eyebrow="Products"
      title="Catalog grid will live here."
      description="Owned product photography leads this surface. Until the local catalog ships, this stage stays empty on purpose — no hotlinked placeholders."
      action={<TextLink to="/search">Go to search</TextLink>}
    />
  );
}
