import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function HomeScreen() {
  return (
    <EmptyState
      eyebrow="TTSetupBuilder"
      title="Explore equipment like a visual archive."
      description="A photography-first database for blades, rubbers, and professional setups — not a shop. Catalog media and search land in later milestones."
      action={
        <div className="flex flex-wrap gap-3">
          <TextLink to="/products">Browse products</TextLink>
          <TextLink to="/builder">Open builder</TextLink>
        </div>
      }
    />
  );
}
