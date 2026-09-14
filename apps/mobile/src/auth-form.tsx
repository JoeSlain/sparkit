import { useState } from 'react';
import { Keyboard } from 'react-native';
import { useLingui } from '@lingui/react/macro';
import { safeParse } from 'valibot';
import { authInputSchema } from '@sparkit/validation';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { Action, Field, Notice } from './ui';

type Credentials = { email: string; password: string };
type AuthResult = { confirmationRequired?: boolean };
export function AuthForm({
  onSubmit,
}: {
  onSubmit: (mode: 'signin' | 'signup', values: Credentials) => Promise<AuthResult>;
}) {
  const { t } = useLingui();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  async function submit(mode: 'signin' | 'signup') {
    if (pending) return;
    const result = safeParse(authInputSchema, { email: email.trim(), password });
    setConfirmation(false);
    if (!result.success) {
      setError(t`Enter a valid email and a password with at least 8 characters.`);
      return;
    }
    Keyboard.dismiss();
    setPending(true);
    setError(null);
    try {
      const response = await onSubmit(mode, result.output);
      setPassword('');
      setConfirmation(response.confirmationRequired === true);
    } catch {
      setError(
        mode === 'signin'
          ? t`We couldn't sign you in. Check your email and password, then try again.`
          : t`We couldn't create your account. Please try again.`,
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <YStack gap={18}>
      <Field
        label={t`Email address`}
        testID="email-input"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        editable={!pending}
        placeholder="you@example.com"
      />
      <Field
        label={t`Password`}
        testID="password-input"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        editable={!pending}
        returnKeyType="go"
        onSubmitEditing={() => {
          void submit('signin');
        }}
      />
      <Notice>{error}</Notice>
      <Notice success>
        {confirmation ? t`Check your email to confirm your account, then sign in.` : null}
      </Notice>
      <Action
        testID="sign-in-button"
        disabled={pending}
        onPress={() => {
          void submit('signin');
        }}
      >
        {pending ? t`Please wait…` : t`Sign in`}
      </Action>
      <Action
        secondary
        testID="sign-up-button"
        disabled={pending}
        onPress={() => {
          void submit('signup');
        }}
      >{t`Create an account`}</Action>
      <Text
        fontSize={12}
        color="$muted"
        textAlign="center"
      >{t`Your tasks are private. Make room for what matters.`}</Text>
    </YStack>
  );
}
