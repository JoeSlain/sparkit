import { useLingui } from '@lingui/react/macro';
import { useLocale } from '../lib/providers';
export function LocaleSwitcher() {
  const { t } = useLingui();
  const { locale, changeLocale } = useLocale();
  return (
    <div className="locale-switcher" role="group" aria-label={t`Language`}>
      <button
        data-testid="locale-en"
        aria-label="English"
        lang="en"
        aria-pressed={locale === 'en'}
        onClick={() => changeLocale('en')}
      >
        EN
      </button>
      <button
        data-testid="locale-fr"
        aria-label="Français"
        lang="fr"
        aria-pressed={locale === 'fr'}
        onClick={() => changeLocale('fr')}
      >
        FR
      </button>
    </div>
  );
}
