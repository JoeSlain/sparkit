import { authInputSchema } from '@agency/validation';
import { safeParse } from 'valibot';
import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { AppClient } from '@agency/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Notice } from './ui/notice';

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
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="eyebrow">
        <span className="status-dot" />
        <Trans>A little space for progress</Trans>
      </div>
      <h1 id="auth-title">
        {mode === 'signin' ? (
          <Trans>Welcome back.</Trans>
        ) : (
          <Trans>Make room for what matters.</Trans>
        )}
      </h1>
      <p className="muted auth-description">
        {mode === 'signin' ? (
          <Trans>Your ideas, your tasks, your next step. Pick up where you left off.</Trans>
        ) : (
          <Trans>
            Create your private workspace and turn a little intention into everyday progress.
          </Trans>
        )}
      </p>
      <form onSubmit={submit} className="form-stack" aria-busy={pending} noValidate>
        <div className="field">
          <label htmlFor="email">
            <Trans>Email address</Trans>
          </label>
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
        </div>
        <div className="field">
          <label htmlFor="password">
            <Trans>Password</Trans>
          </label>
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
          <span className="field-hint" id="password-hint">
            <Trans>At least 8 characters.</Trans>
          </span>
        </div>
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
        <Button
          type="submit"
          data-testid={mode === 'signin' ? 'sign-in-button' : 'sign-up-button'}
          disabled={pending}
          className="auth-submit"
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
      </form>
      <div className="auth-switch">
        <span>
          {mode === 'signin' ? (
            <Trans>New around here?</Trans>
          ) : (
            <Trans>Already have an account?</Trans>
          )}
        </span>
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
      </div>
    </section>
  );
}
