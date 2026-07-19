import { useParams } from 'react-router-dom';
import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function PlayerDetailScreen() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <EmptyState
      eyebrow="Player profile"
      title={slug ? `Profile for “${slug}” is reserved.` : 'Player profile reserved.'}
      description="Profiles will surface career context and equipment graphs. No storefront chrome — exploration only."
      action={<TextLink to="/players">Back to players</TextLink>}
    />
  );
}
