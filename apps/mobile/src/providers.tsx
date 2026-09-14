import {
  createContext,
  useCallback,
  useMemo,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { I18nProvider } from '@lingui/react';
import { createI18n, activateLocale, type Locale } from '@agency/i18n';
import type { Session } from '@supabase/supabase-js';
import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { TamaguiProvider } from '@tamagui/core';
import { client } from './client';
import {
  initNativeIntegrations,
  syncNativeIntegrationUser,
  nativeIntegrationFlags,
} from './integrations';
import { clearAccountCache, queryClient } from './query';
import { tamaguiConfig } from './tamagui.config';

initNativeIntegrations();
void nativeIntegrationFlags;

const i18n = createI18n(getLocales()[0]?.languageCode === 'fr' ? 'fr' : 'en');
const SessionContext = createContext<{
  session: Session | null;
  ready: boolean;
  error: string | null;
}>({ session: null, ready: false, error: null });
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({
  locale: 'en',
  setLocale: () => undefined,
});
export const useSession = () => useContext(SessionContext);
export const useLocale = () => useContext(LocaleContext);

export function Providers({ children }: PropsWithChildren) {
  const [locale, updateLocale] = useState<Locale>(i18n.locale === 'fr' ? 'fr' : 'en');
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!client);
  const [error, setError] = useState<string | null>(null);
  const userId = useRef<string | null>(null);
  const localeChosen = useRef(false);
  const setLocale = useCallback((next: Locale) => {
    localeChosen.current = true;
    activateLocale(i18n, next);
    updateLocale(next);
    void SecureStore.setItemAsync('workspace.locale', next).catch(() => undefined);
  }, []);
  const localeContext = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  const sessionContext = useMemo(() => ({ session, ready, error }), [session, ready, error]);

  useEffect(() => {
    let active = true;
    void SecureStore.getItemAsync('workspace.locale')
      .then((saved) => {
        if (active && !localeChosen.current && (saved === 'en' || saved === 'fr')) {
          activateLocale(i18n, saved);
          updateLocale(saved);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    onlineManager.setEventListener((setOnline) =>
      NetInfo.addEventListener((state) => {
        setOnline(state.isConnected === true && state.isInternetReachable !== false);
      }),
    );
    const update = (state: string) => {
      const focused = state === 'active';
      focusManager.setFocused(focused);
      if (focused) client?.auth.startAutoRefresh();
      else client?.auth.stopAutoRefresh();
    };
    update(AppState.currentState);
    const listener = AppState.addEventListener('change', update);
    return () => {
      listener.remove();
      client?.auth.stopAutoRefresh();
      onlineManager.setEventListener(() => () => undefined);
    };
  }, []);

  useEffect(() => {
    if (!client) return;
    let active = true;
    let receivedEvent = false;
    const accept = (next: Session | null) => {
      if (!active) return;
      clearAccountCache(userId.current, next?.user.id ?? null, queryClient);
      userId.current = next?.user.id ?? null;
      setSession(next);
      setReady(true);
      setError(null);
      void syncNativeIntegrationUser(
        next?.user ? { id: next.user.id, email: next.user.email ?? null } : null,
      );
    };
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      receivedEvent = true;
      accept(next);
    });
    void client.auth
      .getSession()
      .then(({ data: snapshot, error: failure }) => {
        if (!active || receivedEvent) return;
        if (failure) {
          setError(failure.message);
          setReady(true);
        } else accept(snapshot.session);
      })
      .catch(() => {
        if (active && !receivedEvent) {
          setError('Unable to restore your session.');
          setReady(true);
        }
      });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <I18nProvider i18n={i18n}>
        <LocaleContext.Provider value={localeContext}>
          <QueryClientProvider client={queryClient}>
            <SessionContext.Provider value={sessionContext}>{children}</SessionContext.Provider>
          </QueryClientProvider>
        </LocaleContext.Provider>
      </I18nProvider>
    </TamaguiProvider>
  );
}
