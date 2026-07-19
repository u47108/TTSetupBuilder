import { useParams } from 'react-router-dom';
import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function ProductDetailScreen() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <EmptyState
      eyebrow="Product detail"
      title={slug ? `Waiting on “${slug}”.` : 'Product not loaded yet.'}
      description="Detail pages open on media galleries (multiple images per product). Specs, players, and reference stores arrive with the catalog milestone."
      action={<TextLink to="/products">Back to products</TextLink>}
    />
  );
}
