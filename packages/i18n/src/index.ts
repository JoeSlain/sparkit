import { setupI18n, type I18n } from '@lingui/core';
import { messages as en } from '../locales/en/messages';
import { messages as fr } from '../locales/fr/messages';

export type Locale = 'en' | 'fr';
const catalogs = { en, fr };

export function createI18n(locale: Locale = 'en'): I18n {
  return setupI18n({ locale, messages: catalogs });
}

export function activateLocale(instance: I18n, locale: Locale): void {
  instance.loadAndActivate({ locale, messages: catalogs[locale] });
}

export function resolveLocale(preferred?: string | null): Locale {
  return preferred?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
