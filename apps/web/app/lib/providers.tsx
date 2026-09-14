import { createI18n, activateLocale, type Locale } from '@sparkit/i18n';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createQueryClient } from './query';

let volatileLocale: Locale | undefined;
function readLocale(): Locale {
  try {
    const stored = localStorage.getItem('sparkit.locale');
    if (stored === 'en' || stored === 'fr') return stored;
  } catch {
    /* Browser storage may be disabled. */
  }
  return volatileLocale ?? (navigator.language.startsWith('fr') ? 'fr' : 'en');
}
function subscribeLocale(onChange: () => void) {
  window.addEventListener('sparkit-locale', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('sparkit-locale', onChange);
    window.removeEventListener('storage', onChange);
  };
}
function changeLocale(locale: Locale) {
  try {
    localStorage.setItem('sparkit.locale', locale);
    volatileLocale = undefined;
  } catch {
    volatileLocale = locale;
  }
  window.dispatchEvent(new Event('sparkit-locale'));
}
const LocaleContext = createContext<{ locale: Locale; changeLocale: (locale: Locale) => void }>({
  locale: 'en',
  changeLocale,
});
export const useLocale = () => useContext(LocaleContext);

export function Providers({ children }: { children: ReactNode }) {
  const [i18n] = useState(() => createI18n('en'));
  const [queryClient] = useState(createQueryClient);
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => 'en' as const);
  const localeContext = useMemo(() => ({ locale, changeLocale }), [locale]);
  useEffect(() => {
    activateLocale(i18n, locale);
    document.documentElement.lang = locale;
  }, [i18n, locale]);
  return (
    <I18nProvider i18n={i18n}>
      <LocaleContext.Provider value={localeContext}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </LocaleContext.Provider>
    </I18nProvider>
  );
}
