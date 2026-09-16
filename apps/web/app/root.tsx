import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Trans } from '@lingui/react/macro';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { colors } from '@sparkit/tokens';
import type { ReactNode } from 'react';
import { Providers } from './lib/providers';
import { Button } from './components/ui';
import './styles.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f7f7f4" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}
export function ErrorBoundary() {
  return (
    <Providers>
      <main>
        <YStack maxWidth={560} marginHorizontal="auto" padding={32} gap={16}>
          <Text fontSize={28} fontWeight="600" color={colors.ink}>
            <Trans>Something went wrong</Trans>
          </Text>
          <Text color={colors.muted}>
            <Trans>Please reload the page to try again.</Trans>
          </Text>
          <Button onClick={() => window.location.assign('/')}>
            <Trans>Back to workspace</Trans>
          </Button>
        </YStack>
      </main>
    </Providers>
  );
}
