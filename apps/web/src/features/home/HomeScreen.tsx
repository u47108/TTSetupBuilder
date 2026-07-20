import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';
import { useT } from '@/shared/i18n/useT';

export function HomeScreen() {
  const t = useT();
  return (
    <EmptyState
      eyebrow={t('home.eyebrow')}
      title={t('home.title')}
      description={t('home.description')}
      action={
        <div className="flex flex-wrap gap-3">
          <TextLink to="/products">{t('home.browseProducts')}</TextLink>
          <TextLink to="/builder">{t('home.openBuilder')}</TextLink>
        </div>
      }
    />
  );
}
