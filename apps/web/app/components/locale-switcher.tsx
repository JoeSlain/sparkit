import { useLingui } from '@lingui/react/macro';
import { XStack } from '@tamagui/stacks';
import { colors } from '@sparkit/tokens';
import { useLocale } from '../lib/providers';

export function LocaleSwitcher() {
  const { t } = useLingui();
  const { locale, changeLocale } = useLocale();
  return (
    <XStack
      role="group"
      aria-label={t`Language`}
      gap={4}
      backgroundColor="white"
      borderWidth={1}
      borderColor={colors.border}
      borderRadius={999}
      padding={4}
    >
      {(
        [
          { id: 'en', label: 'EN', aria: 'English' },
          { id: 'fr', label: 'FR', aria: 'Français' },
        ] as const
      ).map((option) => {
        const active = locale === option.id;
        return (
          <button
            key={option.id}
            type="button"
            data-testid={`locale-${option.id}`}
            aria-label={option.aria}
            lang={option.id}
            aria-pressed={active}
            onClick={() => changeLocale(option.id)}
            style={{
              minHeight: 32,
              minWidth: 40,
              borderRadius: 999,
              border: 0,
              backgroundColor: active ? colors.accentSoft : 'transparent',
              color: active ? colors.accent : colors.muted,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </XStack>
  );
}
