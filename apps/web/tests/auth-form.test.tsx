import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@lingui/react';
import { setupI18n } from '@lingui/core';
import { describe, expect, it, vi } from 'vitest';
import type { AppClient } from '@agency/supabase';
import { AuthForm } from '../app/components/auth-form';
function show(client: AppClient) {
  return render(
    <I18nProvider i18n={setupI18n({ locale: 'en', messages: {} })}>
      <AuthForm client={client} />
    </I18nProvider>,
  );
}
describe('authentication form', () => {
  it.each([
    ['invalid-email', 'long-password'],
    ['person@example.test', 'short'],
  ])('validates %s through the shared schema before contacting auth', async (email, password) => {
    const user = userEvent.setup();
    const signInWithPassword = vi.fn();
    show({ auth: { signInWithPassword } } as unknown as AppClient);
    await user.type(screen.getByTestId('email-input'), email);
    await user.type(screen.getByTestId('password-input'), password);
    await user.click(screen.getByTestId('sign-in-button'));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a valid email and a password with at least 8 characters.',
    );
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('shows confirmation instructions when signup returns no session', async () => {
    const user = userEvent.setup();
    const signUp = vi.fn(async () => ({ data: { session: null }, error: null }));
    show({ auth: { signUp } } as unknown as AppClient);
    await user.click(screen.getByTestId('sign-up-button'));
    await user.type(screen.getByTestId('email-input'), 'person@example.test');
    await user.type(screen.getByTestId('password-input'), 'long-password');
    await user.click(screen.getByTestId('sign-up-button'));
    expect(signUp).toHaveBeenCalledWith({
      email: 'person@example.test',
      password: 'long-password',
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Check your email');
  });
  it('shows a useful error without displaying backend diagnostic details', async () => {
    const user = userEvent.setup();
    const signInWithPassword = vi.fn(async () => ({
      data: { session: null },
      error: new Error('internal diagnostic'),
    }));
    show({ auth: { signInWithPassword } } as unknown as AppClient);
    await user.type(screen.getByTestId('email-input'), 'person@example.test');
    await user.type(screen.getByTestId('password-input'), 'long-password');
    await user.click(screen.getByTestId('sign-in-button'));
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't sign you in");
    expect(screen.queryByText('internal diagnostic')).not.toBeInTheDocument();
  });
});
