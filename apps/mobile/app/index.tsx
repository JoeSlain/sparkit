import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { useLingui } from '@lingui/react/macro';
import { colors } from '@sparkit/tokens';
import { client } from '../src/client';
import { AuthForm } from '../src/auth-form';
import { Brand, Card, Notice } from '../src/ui';
import { LocaleSwitch } from '../src/locale-switch';
import { useSession } from '../src/providers';
import { Dashboard } from '../src/dashboard';

export default function HomeScreen() {
  const { t } = useLingui();
  const { session, ready, error } = useSession();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 48 }}
        >
          <YStack gap={32} width="100%" maxWidth={600} alignSelf="center" flex={1}>
            <XStack justifyContent="space-between" alignItems="center">
              <Brand />
              <LocaleSwitch />
            </XStack>
            {!client ? (
              <YStack gap={20} paddingTop={48}>
                <Text fontSize={32} fontWeight="700">{t`A little setup first`}</Text>
                <Text
                  color={colors.muted}
                  lineHeight={24}
                >{t`This workspace isn't connected yet. Add the Supabase URL and publishable key to the mobile environment, then restart the app.`}</Text>
              </YStack>
            ) : !ready ? (
              <ActivityIndicator
                accessibilityLabel={t`Restoring your session`}
                color={colors.accent}
              />
            ) : session ? (
              <Dashboard key={session.user.id} client={client} user={session.user} />
            ) : (
              <>
                <YStack gap={12} paddingTop={32}>
                  <Text
                    color={colors.accent}
                    fontSize={12}
                    fontWeight="700"
                    letterSpacing={2}
                  >{t`YOUR SPACE TO FOCUS`}</Text>
                  <Text
                    fontSize={38}
                    lineHeight={44}
                    fontWeight="700"
                    letterSpacing={-1.5}
                  >{t`Good things start\nwith a clear mind.`}</Text>
                  <Text
                    color={colors.muted}
                    fontSize={16}
                    lineHeight={24}
                  >{t`A calm home for your tasks, ideas, and everyday progress.`}</Text>
                </YStack>
                <Card>
                  <Notice>
                    {error
                      ? t`Your previous session couldn't be restored. Please sign in again.`
                      : null}
                  </Notice>
                  <AuthForm
                    onSubmit={async (mode, values) => {
                      if (!client) throw new Error('Client is not configured');
                      const result =
                        mode === 'signin'
                          ? await client.auth.signInWithPassword(values)
                          : await client.auth.signUp(values);
                      if (result.error) throw result.error;
                      return { confirmationRequired: mode === 'signup' && !result.data.session };
                    }}
                  />
                </Card>
              </>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
