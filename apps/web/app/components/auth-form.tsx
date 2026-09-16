import { authInputSchema } from '@sparkit/validation';
import { safeParse } from 'valibot';
import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { colors } from '@sparkit/tokens';
import type { AppClient } from '@sparkit/supabase';
import { Button, Card, Eyebrow, Field, Input, Notice } from './ui';

export function AuthForm({ client }: { client: AppClient }) {
  const { t } = useLingui();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError('');
    setMessage('');
    const parsed = safeParse(authInputSchema, { email, password });
    if (!parsed.success) {
      setError(t`Enter a valid email and a password with at least 8 characters.`);
      return;
    }
    setPending(true);
    try {
      const credentials = parsed.output;
      const result =
        mode === 'signin'
          ? await client.auth.signInWithPassword(credentials)
          : await client.auth.signUp(credentials);
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session)
        setMessage(t`Check your email to confirm your account, then sign in.`);
    } catch {
      setError(
        mode === 'signin'
          ? t`We couldn't sign you in. Check your email and password and try again.`
          : t`We couldn't create your account. Check your details and try again.`,
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <section aria-labelledby="auth-title" style={{ width: '100%', maxWidth: 480 }}>
      <Card>
        <Eyebrow>
          <Trans>A little space for progress</Trans>
        </Eyebrow>
        <Text id="auth-title" fontSize={32} fontWeight="600" letterSpacing={-1} color={colors.ink}>
          {mode === 'signin' ? (
            <Trans>Welcome back.</Trans>
          ) : (
            <Trans>Make room for what matters.</Trans>
          )}
        </Text>
        <Text fontSize={15} lineHeight={24} color={colors.muted}>
          {mode === 'signin' ? (
            <Trans>Your ideas, your tasks, your next step. Pick up where you left off.</Trans>
          ) : (
            <Trans>
              Create your private workspace and turn a little intention into everyday progress.
            </Trans>
          )}
        </Text>
        <form onSubmit={submit} aria-busy={pending} noValidate>
          <YStack gap={16}>
            <Field label={<Trans>Email address</Trans>} htmlFor="email">
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={pending}
              />
            </Field>
            <Field
              label={<Trans>Password</Trans>}
              htmlFor="password"
              hint={<Trans>At least 8 characters.</Trans>}
            >
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-hint"
                disabled={pending}
              />
            </Field>
            {error ? <Notice error>{error}</Notice> : null}
            {message ? <Notice>{message}</Notice> : null}
            <Button
              type="submit"
              data-testid={mode === 'signin' ? 'sign-in-button' : 'sign-up-button'}
              disabled={pending}
              style={{ width: '100%' }}
            >
              {pending ? (
                <Trans>One moment…</Trans>
              ) : mode === 'signin' ? (
                <Trans>Sign in</Trans>
              ) : (
                <Trans>Create account</Trans>
              )}
              <span aria-hidden="true">↗</span>
            </Button>
          </YStack>
        </form>
        <XStack gap={8} alignItems="center" flexWrap="wrap">
          <Text fontSize={14} color={colors.muted}>
            {mode === 'signin' ? (
              <Trans>New around here?</Trans>
            ) : (
              <Trans>Already have an account?</Trans>
            )}
          </Text>
          <Button
            variant="ghost"
            data-testid={mode === 'signin' ? 'sign-up-button' : 'sign-in-button'}
            disabled={pending}
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setMessage('');
            }}
          >
            {mode === 'signin' ? <Trans>Create an account</Trans> : <Trans>Sign in</Trans>}
          </Button>
        </XStack>
      </Card>
    </section>
  );
}
