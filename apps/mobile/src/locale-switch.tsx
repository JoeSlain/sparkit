import { Pressable } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack } from '@tamagui/stacks';
import { colors } from '@sparkit/tokens';
import { useLocale } from './providers';

export function LocaleSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <XStack gap={4} backgroundColor={colors.accentSoft} borderRadius={12} padding={3}>
      {(['en', 'fr'] as const).map((value) => (
        <Pressable
          key={value}
          testID={`locale-${value}`}
          accessibilityRole="button"
          accessibilityLabel={value === 'en' ? 'English' : 'Français'}
          accessibilityState={{ selected: locale === value }}
          onPress={() => setLocale(value)}
          style={{
            minHeight: 40,
            minWidth: 42,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: locale === value ? 'white' : 'transparent',
            borderRadius: 9,
          }}
        >
          <Text fontWeight="600" fontSize={12} color={colors.accent}>
            {value.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </XStack>
  );
}
