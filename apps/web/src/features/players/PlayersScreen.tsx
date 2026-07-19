import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function PlayersScreen() {
  return (
    <EmptyState
      eyebrow="Players"
      title="Professional setups, not athlete merch."
      description="Player index will connect athletes to blades, rubbers, and full rackets. Photography and relationship data are still offline."
      action={<TextLink to="/">Return home</TextLink>}
    />
  );
}
