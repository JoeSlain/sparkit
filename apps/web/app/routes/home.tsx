import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { client } from '../lib/client';
import { useSession } from '../lib/use-session';
import { WebIntegrations } from '../lib/web-integrations';
import { Brand } from '../components/brand';
import { LocaleSwitcher } from '../components/locale-switcher';
import { AuthForm } from '../components/auth-form';
import { Tasks } from '../components/tasks';
import { Profile } from '../components/profile';
import { Button } from '../components/ui/button';
import { Notice } from '../components/ui/notice';

export function meta() {
  return [{ title: 'Workspace · Sparkit' }];
}
export default function Home() {
  const { session, loading, failed } = useSession(client);
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);
  async function signOut() {
    if (!client || signingOut) return;
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      await queryClient.cancelQueries();
      queryClient.clear();
    } catch {
      setSignOutFailed(true);
    } finally {
      setSigningOut(false);
    }
  }
  return (
    <div className="app-shell">
      <WebIntegrations session={session} />
      <a className="skip-link" href="#main">
        <Trans>Skip to content</Trans>
      </a>
      <header className="site-header">
        <a href="/" className="brand-link" aria-label="Workspace">
          <Brand />
        </a>
        <div className="header-actions">
          <LocaleSwitcher />
          {session && (
            <Button
              variant="ghost"
              data-testid="sign-out-button"
              disabled={signingOut}
              onClick={() => void signOut()}
            >
              {signingOut ? <Trans>Signing out…</Trans> : <Trans>Sign out</Trans>}
            </Button>
          )}
        </div>
      </header>
      <main id="main" className={session ? 'dashboard' : 'welcome-layout'}>
        {!client ? (
          <section className="panel setup-panel">
            <span className="eyebrow">
              <Trans>Almost ready</Trans>
            </span>
            <h1>
              <Trans>Your workspace is taking shape.</Trans>
            </h1>
            <p className="muted">
              <Trans>
                Connect this app to your Supabase project to enable accounts, profiles, and private
                tasks.
              </Trans>
            </p>
            <div className="setup-values">
              <code>VITE_SUPABASE_URL</code>
              <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
            </div>
            <p className="field-hint">
              <Trans>
                Add these public values to your local environment file, then restart the development
                server.
              </Trans>
            </p>
          </section>
        ) : loading ? (
          <div className="loading-state" role="status">
            <span className="spinner" aria-hidden="true" />
            <Trans>Opening your workspace…</Trans>
          </div>
        ) : failed ? (
          <section className="panel setup-panel">
            <Notice error>
              <Trans>We couldn't restore your session. Please reload to try again.</Trans>
            </Notice>
            <a href="/" className="button button-secondary">
              <Trans>Reload</Trans>
            </a>
          </section>
        ) : session ? (
          <>
            <div className="dashboard-intro">
              <div>
                <div className="eyebrow">
                  <span className="status-dot" />
                  <Trans>Your private workspace</Trans>
                </div>
                <h1>
                  <Trans>A little focus. A little progress.</Trans>
                </h1>
                <p className="muted">
                  <Trans>Keep the important things close, and take them one at a time.</Trans>
                </p>
              </div>
              <div className="intro-symbol" aria-hidden="true">
                ✳
              </div>
            </div>
            {signOutFailed && (
              <Notice error>
                <Trans>We couldn't sign you out. Please try again.</Trans>
              </Notice>
            )}
            <div className="dashboard-grid" key={session.user.id}>
              <Tasks client={client} userId={session.user.id} />
              <aside className="sidebar">
                <Profile client={client} userId={session.user.id} email={session.user.email} />
                <div className="privacy-note">
                  <span aria-hidden="true">◇</span>
                  <p>
                    <Trans>Only you can access your tasks. A space that's yours, by design.</Trans>
                  </p>
                </div>
              </aside>
            </div>
          </>
        ) : (
          <>
            <div className="welcome-art" aria-hidden="true">
              <div className="art-caption">WORKSPACE / 01</div>
              <div className="orb orb-back" />
              <div className="orb orb-front" />
              <div className="art-note">
                <span className="art-note-check">✓</span>
                <div>
                  <span className="art-note-line" />
                  <span className="art-note-line short" />
                </div>
                <span className="art-spark">✳</span>
              </div>
              <div className="art-bottom">
                <span>
                  <Trans>
                    Less noise.
                    <br />
                    More possibility.
                  </Trans>
                </span>
                <span>↗</span>
              </div>
            </div>
            <AuthForm client={client} />
          </>
        )}
      </main>
      <footer className="site-footer">
        <span>WORKSPACE</span>
        <p>
          <Trans>Made for the things that matter.</Trans>
        </p>
        <span className="footer-status">
          <span className="status-dot" />
          <Trans>A calmer place to begin</Trans>
        </span>
      </footer>
    </div>
  );
}
