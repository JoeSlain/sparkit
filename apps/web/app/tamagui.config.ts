import { createFont, createTamagui, createTokens } from '@tamagui/core';
import { colors } from '@sparkit/tokens';

const body = createFont({
  family:
    "Inter, 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  size: { 1: 12, 2: 14, 3: 16, 4: 18, 5: 24, 6: 32, true: 16 },
  lineHeight: { 1: 18, 2: 20, 3: 24, 4: 26, 5: 32, 6: 40, true: 24 },
  weight: { 1: '400', 2: '500', 3: '600', 4: '700', true: '400' },
  letterSpacing: { 1: 0, true: 0 },
});

export const tamaguiConfig = createTamagui({
  defaultFont: 'body',
  fonts: { body, heading: body },
  tokens: createTokens({
    color: { ...colors, white: '#FFFFFF' },
    size: { 0: 0, 1: 24, 2: 32, 3: 40, 4: 48, 5: 56, true: 48 },
    space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, true: 16 },
    radius: { 0: 0, 1: 6, 2: 12, 3: 20, 4: 28, true: 12 },
    zIndex: { 0: 0, 1: 10, 2: 100, true: 0 },
  }),
  themes: {
    light: {
      background: colors.background,
      backgroundHover: '#EFEFF5',
      backgroundPress: '#E8E7F5',
      backgroundFocus: '#EFEFF5',
      color: colors.ink,
      colorHover: '#202332',
      colorPress: '#202332',
      colorFocus: '#202332',
      borderColor: colors.border,
      borderColorHover: '#B7B5E5',
      borderColorPress: '#5551D8',
      borderColorFocus: '#5551D8',
      shadowColor: '#20233215',
      placeholderColor: '#858898',
    },
  },
  settings: { allowedStyleValues: 'somewhat-strict' },
});

type AppConfig = typeof tamaguiConfig;
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}
