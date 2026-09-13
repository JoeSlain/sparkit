import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { I18nProvider } from '@lingui/react';
import { setupI18n } from '@lingui/core';
import { TamaguiProvider } from '@tamagui/core';
import { AuthForm } from '../src/auth-form';
import { tamaguiConfig } from '../src/tamagui.config';

function form(onSubmit: Parameters<typeof AuthForm>[0]['onSubmit']) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <I18nProvider i18n={setupI18n({ locale: 'en', messages: { en: {} } })}>
        <AuthForm onSubmit={onSubmit} />
      </I18nProvider>
    </TamaguiProvider>,
  );
}
it('prevents invalid credentials from reaching the auth service', async () => {
  const submit = jest.fn();
  const screen = form(submit);
  fireEvent.changeText(screen.getByTestId('email-input'), 'not-email');
  fireEvent.changeText(screen.getByTestId('password-input'), 'short');
  fireEvent.press(screen.getByTestId('sign-in-button'));
  expect(submit).not.toHaveBeenCalled();
  expect(await screen.findByRole('alert')).toBeTruthy();
});
it('shows an authentication failure and allows retry without reporting success', async () => {
  const submit = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
  const screen = form(submit);
  fireEvent.changeText(screen.getByTestId('email-input'), 'alice@example.test');
  fireEvent.changeText(screen.getByTestId('password-input'), 'correct-horse-password');
  fireEvent.press(screen.getByTestId('sign-in-button'));
  await waitFor(() =>
    expect(submit).toHaveBeenCalledWith('signin', {
      email: 'alice@example.test',
      password: 'correct-horse-password',
    }),
  );
  expect(await screen.findByRole('alert')).toBeTruthy();
  await waitFor(() => expect(screen.getByTestId('sign-in-button')).toBeEnabled());
});
