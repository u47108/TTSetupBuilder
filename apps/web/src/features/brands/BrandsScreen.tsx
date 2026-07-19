import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function BrandsScreen() {
  return (
    <EmptyState
      eyebrow="Brands"
      title="Manufacturer index placeholder."
      description="Brands group equipment for discovery. Brand photography and product counts will bind to owned catalog data later."
      action={<TextLink to="/products">View products</TextLink>}
    />
  );
}
