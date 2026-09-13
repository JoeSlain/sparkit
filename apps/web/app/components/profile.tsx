import { profileInputSchema } from '@agency/validation';
import { safeParse } from 'valibot';
import { useState, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, type AppClient } from '@agency/supabase';
import { profileKey } from '../lib/query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Notice } from './ui/notice';

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
    <form className="form-stack" onSubmit={submit} aria-busy={save.isPending}>
      <div className="field">
        <label htmlFor="profile-name">
          <Trans>Display name</Trans>
        </label>
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
      </div>
      {validation && (
        <Notice id="profile-validation" error>
          {validation}
        </Notice>
      )}
      {save.isError && (
        <Notice error>
          <Trans>Your profile couldn't be saved. Please try again.</Trans>
        </Notice>
      )}
      {save.isSuccess && (
        <Notice>
          <Trans>Profile saved.</Trans>
        </Notice>
      )}
      <Button
        type="submit"
        variant="secondary"
        data-testid="save-profile-button"
        disabled={save.isPending}
      >
        {save.isPending ? <Trans>Saving…</Trans> : <Trans>Save profile</Trans>}
      </Button>
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
  return (
    <section className="panel profile-panel" aria-labelledby="profile-title">
      <div className="profile-avatar" aria-hidden="true">
        {(profile.data?.display_name || email || 'W').slice(0, 1).toUpperCase()}
      </div>
      <h2 id="profile-title">
        <Trans>Your profile</Trans>
      </h2>
      <p className="profile-email">{email}</p>
      {profile.isPending ? (
        <p role="status" className="muted">
          <Trans>Loading profile…</Trans>
        </p>
      ) : profile.isError ? (
        <>
          <Notice error>
            <Trans>We couldn't load your profile.</Trans>
          </Notice>
          <Button variant="secondary" onClick={() => void profile.refetch()}>
            <Trans>Try again</Trans>
          </Button>
        </>
      ) : (
        <ProfileForm
          key={userId}
          client={client}
          userId={userId}
          initialName={profile.data?.display_name ?? ''}
        />
      )}
    </section>
  );
}
