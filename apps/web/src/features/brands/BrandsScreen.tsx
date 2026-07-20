import { EmptyState } from '@/shared/components/EmptyState';
import { useT } from '@/shared/i18n/useT';

export function BrandsScreen() {
  const t = useT();
  return <EmptyState title={t('brands.title')} description={t('brands.description')} />;
}
