import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import { Providers } from './lib/providers';
import './styles.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f7f6f3" />
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
      <main className="fallback">
        <h1>
          <Trans>Something went wrong</Trans>
        </h1>
        <p>
          <Trans>Please reload the page to try again.</Trans>
        </p>
        <a className="button button-primary" href="/">
          <Trans>Back to workspace</Trans>
        </a>
      </main>
    </Providers>
  );
}
