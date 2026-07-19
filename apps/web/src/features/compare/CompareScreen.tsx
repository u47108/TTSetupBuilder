import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function CompareScreen() {
  return (
    <EmptyState
      eyebrow="Compare"
      title="Side-by-side workspace reserved."
      description="Compare will keep selection shareable via URL. Until products exist, there is nothing honest to stage here."
      action={<TextLink to="/products">Find products to compare</TextLink>}
    />
  );
}
