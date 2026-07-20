import { useParams } from 'react-router-dom';
import { EmptyState } from '@/shared/components/EmptyState';
import { useT } from '@/shared/i18n/useT';

export function PlayerDetailScreen() {
  const t = useT();
  const { slug } = useParams<{ slug: string }>();
  return (
    <EmptyState
      eyebrow={t('players.detailEyebrow')}
      title={t('players.detailTitle', { slug: slug ?? '—' })}
      description={t('players.detailDescription')}
    />
  );
}
