import { profileInputSchema } from '@sparkit/validation';
import { safeParse } from 'valibot';
import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Text } from '@tamagui/core';
import { YStack } from '@tamagui/stacks';
import { colors } from '@sparkit/tokens';
import { getProfile, updateProfile, type AppClient } from '@sparkit/supabase';
import { profileKey } from '../lib/query';
import { Button, Card, Field, Input, Notice } from './ui';

function ProfileForm({
  client,
  userId,
  initialName,
}: {
  client: AppClient;
  userId: string;
  initialName: string;
}) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [name, setName] = useState(initialName);
  const [validation, setValidation] = useState('');
  const save = useMutation({
    mutationFn: (display_name: string) => updateProfile(client, { display_name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileKey(userId) });
    },
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const parsed = safeParse(profileInputSchema, { display_name: name });
    if (!parsed.success) {
      setValidation(t`Your name must be between 1 and 80 characters.`);
      return;
    }
    setValidation('');
    save.mutate(parsed.output.display_name);
  }
  return (
    <form onSubmit={submit} aria-busy={save.isPending}>
      <YStack gap={16}>
        <Field label={<Trans>Display name</Trans>} htmlFor="profile-name">
          <Input
            id="profile-name"
            data-testid="profile-name-input"
            autoComplete="nickname"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              save.reset();
            }}
            maxLength={80}
            disabled={save.isPending}
            aria-invalid={!!validation}
            aria-describedby={validation ? 'profile-validation' : undefined}
          />
        </Field>
        {validation ? (
          <Notice id="profile-validation" error>
            {validation}
          </Notice>
        ) : null}
        {save.isError ? (
          <Notice error>
            <Trans>Your profile couldn't be saved. Please try again.</Trans>
          </Notice>
        ) : null}
        {save.isSuccess ? (
          <Notice>
            <Trans>Profile saved.</Trans>
          </Notice>
        ) : null}
        <Button
          type="submit"
          variant="secondary"
          data-testid="save-profile-button"
          disabled={save.isPending}
        >
          {save.isPending ? <Trans>Saving…</Trans> : <Trans>Save profile</Trans>}
        </Button>
      </YStack>
    </form>
  );
}

export function Profile({
  client,
  userId,
  email,
}: {
  client: AppClient;
  userId: string;
  email?: string;
}) {
  const profile = useQuery({ queryKey: profileKey(userId), queryFn: () => getProfile(client) });
  const initial = (profile.data?.display_name || email || 'W').slice(0, 1).toUpperCase();
  return (
    <section aria-labelledby="profile-title">
      <Card>
        <YStack
          width={56}
          height={56}
          borderRadius={16}
          backgroundColor={colors.accentSoft}
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          <Text fontSize={22} fontWeight="700" color={colors.accent}>
            {initial}
          </Text>
        </YStack>
        <Text id="profile-title" fontSize={22} fontWeight="600" color={colors.ink}>
          <Trans>Your profile</Trans>
        </Text>
        <Text color={colors.muted}>{email}</Text>
        {profile.isPending ? (
          <Text role="status" color={colors.muted}>
            <Trans>Loading profile…</Trans>
          </Text>
        ) : profile.isError ? (
          <YStack gap={12}>
            <Notice error>
              <Trans>We couldn't load your profile.</Trans>
            </Notice>
            <Button variant="secondary" onClick={() => void profile.refetch()}>
              <Trans>Try again</Trans>
            </Button>
          </YStack>
        ) : (
          <ProfileForm
            key={userId}
            client={client}
            userId={userId}
            initialName={profile.data?.display_name ?? ''}
          />
        )}
      </Card>
    </section>
  );
}
