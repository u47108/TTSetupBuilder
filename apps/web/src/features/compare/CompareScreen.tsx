import { EmptyState } from '@/shared/components/EmptyState';
import { useT } from '@/shared/i18n/useT';

export function CompareScreen() {
  const t = useT();
  return <EmptyState title={t('compare.title')} description={t('compare.description')} />;
}
