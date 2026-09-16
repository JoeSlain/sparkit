import type {
  ButtonHTMLAttributes,
  ComponentProps,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { colors } from '@sparkit/tokens';

const inputStyle: CSSProperties = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: colors.border,
  borderRadius: 12,
  backgroundColor: '#FCFCFD',
  paddingInline: 14,
  minHeight: 50,
  color: colors.ink,
  fontSize: 16,
  paddingBlock: 12,
  width: '100%',
};

const buttonBase: CSSProperties = {
  minHeight: 48,
  paddingBlock: 13,
  paddingInline: 18,
  borderRadius: 12,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  borderWidth: 0,
  borderStyle: 'solid',
  fontWeight: 600,
  fontSize: 15,
};

const buttonVariants = {
  primary: {
    ...buttonBase,
    backgroundColor: colors.accent,
    color: '#FFFFFF',
  },
  secondary: {
    ...buttonBase,
    backgroundColor: colors.accentSoft,
    color: colors.accent,
  },
  ghost: {
    ...buttonBase,
    backgroundColor: 'transparent',
    color: colors.ink,
    minHeight: 40,
    paddingBlock: 8,
    paddingInline: 12,
  },
  danger: {
    ...buttonBase,
    backgroundColor: '#FCEBEA',
    color: colors.danger,
  },
} as const;

export function Button({
  variant = 'primary',
  style,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  children?: ReactNode;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        ...buttonVariants[variant],
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input style={{ ...inputStyle, ...style }} {...props} />;
}

export function Notice({
  children,
  error = false,
  id,
}: {
  children: ReactNode;
  error?: boolean;
  id?: string;
}) {
  if (!children) return null;
  return (
    <Text
      id={id}
      role={error ? 'alert' : 'status'}
      color={error ? colors.danger : colors.success}
      fontSize={14}
      lineHeight={21}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  ...props
}: {
  children: ReactNode;
} & ComponentProps<typeof YStack>) {
  return (
    <YStack
      backgroundColor="white"
      borderRadius={20}
      padding={20}
      gap={18}
      borderWidth={1}
      borderColor={colors.border}
      {...props}
    >
      {children}
    </YStack>
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
      <Text fontSize={19} fontWeight="700" letterSpacing={-0.5} color={colors.ink}>
        Workspace
      </Text>
    </XStack>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <XStack gap={8} alignItems="center">
      <YStack width={8} height={8} borderRadius={999} backgroundColor={colors.accent} aria-hidden />
      <Text fontSize={13} fontWeight="600" color={colors.muted} letterSpacing={0.2}>
        {children}
      </Text>
    </XStack>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <YStack gap={8}>
      <label htmlFor={htmlFor} style={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>
        {label}
      </label>
      {children}
      {hint ? (
        <Text fontSize={12} color={colors.muted} id={`${htmlFor}-hint`}>
          {hint}
        </Text>
      ) : null}
    </YStack>
  );
}
