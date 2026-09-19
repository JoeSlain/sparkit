import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { colors } from '@sparkit/tokens';
import { client } from '../lib/client';
import { useSession } from '../lib/use-session';
import { WebIntegrations } from '../lib/web-integrations';
import { AuthForm } from '../components/auth-form';
import { Tasks } from '../components/tasks';
import { Profile } from '../components/profile';
import { LocaleSwitcher } from '../components/locale-switcher';
import { Brand, Button, Card, Eyebrow, Notice } from '../components/ui';

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
    <YStack maxWidth={1440} width="100%" marginHorizontal="auto" paddingHorizontal="6%" flex={1}>
      <WebIntegrations session={session} />
      <a className="skip-link" href="#main">
        <Trans>Skip to content</Trans>
      </a>
      <header>
        <XStack minHeight={96} alignItems="center" justifyContent="space-between" gap={20}>
          <a href="/" aria-label="Workspace">
            <Brand />
          </a>
          <XStack gap={12} alignItems="center">
            <LocaleSwitcher />
            {session ? (
              <Button
                variant="ghost"
                data-testid="sign-out-button"
                disabled={signingOut}
                onClick={() => void signOut()}
              >
                {signingOut ? <Trans>Signing out…</Trans> : <Trans>Sign out</Trans>}
              </Button>
            ) : null}
          </XStack>
        </XStack>
      </header>
      <main id="main">
        <YStack
          flex={1}
          gap={24}
          paddingBottom={40}
          {...(session
            ? {}
            : {
                flexDirection: 'row' as const,
                flexWrap: 'wrap' as const,
                alignItems: 'center' as const,
                justifyContent: 'space-between' as const,
              })}
        >
          {!client ? (
            <Card maxWidth={560} width="100%">
              <Eyebrow>
                <Trans>Almost ready</Trans>
              </Eyebrow>
              <Text fontSize={32} fontWeight="600" letterSpacing={-1} color={colors.ink}>
                <Trans>Your workspace is taking shape.</Trans>
              </Text>
              <Text color={colors.muted} lineHeight={24}>
                <Trans>
                  Connect this app to your Supabase project to enable accounts, profiles, and
                  private tasks.
                </Trans>
              </Text>
              <YStack gap={8}>
                <Text fontSize={13} color={colors.ink}>
                  VITE_SUPABASE_URL
                </Text>
                <Text fontSize={13} color={colors.ink}>
                  VITE_SUPABASE_PUBLISHABLE_KEY
                </Text>
              </YStack>
              <Text fontSize={13} color={colors.muted}>
                <Trans>
                  Add these public values to your local environment file, then restart the
                  development server.
                </Trans>
              </Text>
            </Card>
          ) : loading ? (
            <Text role="status" color={colors.muted}>
              <Trans>Opening your workspace…</Trans>
            </Text>
          ) : failed ? (
            <Card maxWidth={560} width="100%" gap={16}>
              <Notice error>
                <Trans>We couldn't restore your session. Please reload to try again.</Trans>
              </Notice>
              <Button variant="secondary" onClick={() => window.location.assign('/')}>
                <Trans>Reload</Trans>
              </Button>
            </Card>
          ) : session ? (
            <>
              <XStack
                justifyContent="space-between"
                alignItems="flex-start"
                gap={20}
                flexWrap="wrap"
              >
                <YStack gap={8} maxWidth={640}>
                  <Eyebrow>
                    <Trans>Your private workspace</Trans>
                  </Eyebrow>
                  <Text fontSize={36} fontWeight="600" letterSpacing={-1.2} color={colors.ink}>
                    <Trans>A little focus. A little progress.</Trans>
                  </Text>
                  <Text color={colors.muted} lineHeight={24}>
                    <Trans>Keep the important things close, and take them one at a time.</Trans>
                  </Text>
                </YStack>
                <Text fontSize={40} color={colors.accent} aria-hidden>
                  ✳
                </Text>
              </XStack>
              {signOutFailed ? (
                <Notice error>
                  <Trans>We couldn't sign you out. Please try again.</Trans>
                </Notice>
              ) : null}
              <XStack key={session.user.id} gap={20} flexWrap="wrap" alignItems="flex-start">
                <YStack flex={2} minWidth={280}>
                  <Tasks client={client} userId={session.user.id} />
                </YStack>
                <aside style={{ flex: 1, minWidth: 260 }}>
                  <YStack gap={16}>
                    <Profile client={client} userId={session.user.id} email={session.user.email} />
                    <XStack
                      gap={12}
                      padding={16}
                      borderRadius={16}
                      backgroundColor={colors.accentSoft}
                      alignItems="flex-start"
                    >
                      <Text aria-hidden>◇</Text>
                      <Text color={colors.ink} fontSize={14} lineHeight={22}>
                        <Trans>
                          Only you can access your tasks. A space that's yours, by design.
                        </Trans>
                      </Text>
                    </XStack>
                  </YStack>
                </aside>
              </XStack>
            </>
          ) : (
            <>
              <YStack
                flex={1}
                minWidth={280}
                minHeight={320}
                borderRadius={28}
                backgroundColor={colors.accentSoft}
                padding={28}
                justifyContent="space-between"
                aria-hidden
              >
                <Text fontSize={12} fontWeight="600" color={colors.accent} letterSpacing={1}>
                  WORKSPACE / 01
                </Text>
                <Text fontSize={28} fontWeight="600" color={colors.ink} letterSpacing={-0.8}>
                  <Trans>
                    Less noise.
                    {'\n'}
                    More possibility.
                  </Trans>
                </Text>
              </YStack>
              <AuthForm client={client} />
            </>
          )}
        </YStack>
      </main>
      <footer>
        <XStack
          paddingVertical={28}
          borderTopWidth={1}
          borderTopColor={colors.border}
          justifyContent="space-between"
          alignItems="center"
          gap={16}
          flexWrap="wrap"
        >
          <Text fontSize={12} fontWeight="700" letterSpacing={1} color={colors.muted}>
            WORKSPACE
          </Text>
          <Text color={colors.muted}>
            <Trans>Made for the things that matter.</Trans>
          </Text>
          <Eyebrow>
            <Trans>A calmer place to begin</Trans>
          </Eyebrow>
        </XStack>
      </footer>
    </YStack>
  );
}
