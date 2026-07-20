import { EmptyState } from '@/shared/components/EmptyState';
import { useT } from '@/shared/i18n/useT';

export function PlayersScreen() {
  const t = useT();
  return <EmptyState title={t('players.title')} description={t('players.description')} />;
}
