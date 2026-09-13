import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { colors } from '@agency/tokens';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <YStack gap={8}>
      <Text fontSize={13} fontWeight="600" color={colors.ink}>
        {label}
      </Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, props.style]}
      />
    </YStack>
  );
}

export function Action({
  children,
  secondary = false,
  ...props
}: ComponentProps<typeof Pressable> & { secondary?: boolean; children: string }) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(props.disabled) }}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        props.disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text fontWeight="600" fontSize={15} color={secondary ? colors.accent : 'white'}>
        {children}
      </Text>
    </Pressable>
  );
}

export function Card({ children }: PropsWithChildren) {
  return (
    <YStack
      backgroundColor="white"
      borderRadius={20}
      padding={20}
      gap={18}
      borderWidth={1}
      borderColor={colors.border}
    >
      {children}
    </YStack>
  );
}

export function Notice({
  children,
  success = false,
}: {
  children: string | null | undefined;
  success?: boolean;
}) {
  if (!children) return null;
  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      color={success ? colors.success : colors.danger}
      fontSize={14}
      lineHeight={21}
    >
      {children}
    </Text>
  );
}

export function Brand() {
  return (
    <XStack gap={10} alignItems="center">
      <YStack
        width={32}
        height={32}
        borderRadius={10}
        backgroundColor={colors.accent}
        alignItems="center"
        justifyContent="center"
      >
        <Text color="white" fontSize={19} fontWeight="700">
          w
        </Text>
      </YStack>
      <Text fontSize={19} fontWeight="700" letterSpacing={-0.5}>
        Workspace
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#FCFCFD',
    paddingHorizontal: 14,
    minHeight: 50,
    color: colors.ink,
    fontSize: 16,
    paddingVertical: 12,
  },
  button: {
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  secondary: { backgroundColor: colors.accentSoft },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.96 }] },
});
