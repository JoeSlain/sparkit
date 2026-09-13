import { useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable } from 'react-native';
import { useLingui } from '@lingui/react/macro';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { safeParse } from 'valibot';
import type { User } from '@supabase/supabase-js';
import {
  listTasks,
  createTask,
  setTaskCompleted,
  deleteTask,
  getProfile,
  updateProfile,
  type AppClient,
  type Profile,
  type Task,
} from '@agency/supabase';
import { taskInputSchema, profileInputSchema } from '@agency/validation';
import { colors } from '@agency/tokens';
import { Action, Card, Field, Notice } from './ui';

export function Dashboard({ client, user }: { client: AppClient; user: User }) {
  const { t } = useLingui();
  const cache = useQueryClient();
  const key = ['tasks', user.id] as const;
  const tasks = useQuery({ queryKey: key, queryFn: () => listTasks(client) });
  const profile = useQuery({ queryKey: ['profile', user.id], queryFn: () => getProfile(client) });
  const [title, setTitle] = useState('');
  const [validation, setValidation] = useState<string | null>(null);
  const add = useMutation({
    mutationFn: (value: string) => createTask(client, { title: value }),
    onSuccess: async () => {
      setTitle('');
      await cache.invalidateQueries({ queryKey: key });
    },
  });
  const toggle = useMutation({
    mutationFn: (task: Task) =>
      setTaskCompleted(client, { id: task.id, completed: !task.completed }),
    onMutate: async (task) => {
      await cache.cancelQueries({ queryKey: key });
      const previous = cache.getQueryData<Task[]>(key);
      cache.setQueryData<Task[]>(key, (tasks = []) =>
        tasks.map((row) => (row.id === task.id ? { ...row, completed: !row.completed } : row)),
      );
      return { previous };
    },
    onError: (_error, _task, context) => {
      if (context?.previous) cache.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void cache.invalidateQueries({ queryKey: key });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteTask(client, id),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: key });
    },
  });
  // Auth state changes clear all account queries in Providers. Invalidating here
  // would refetch private data during sign-out instead of removing it.
  const logout = useMutation({
    mutationFn: async () => {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
    },
  });
  const complete = tasks.data?.filter((task) => task.completed).length ?? 0;
  const total = tasks.data?.length ?? 0;
  const mutationPending = add.isPending || toggle.isPending || remove.isPending;
  const taskError = add.isError || toggle.isError || remove.isError;
  function submitTask() {
    if (mutationPending) return;
    const result = safeParse(taskInputSchema, { title });
    if (!result.success) {
      setValidation(t`Give your task a title between 1 and 160 characters.`);
      return;
    }
    Keyboard.dismiss();
    setValidation(null);
    add.reset();
    toggle.reset();
    remove.reset();
    add.mutate(result.output.title);
  }
  return (
    <YStack gap={24}>
      <YStack gap={8} paddingTop={12}>
        <Text
          fontSize={12}
          fontWeight="700"
          color={colors.accent}
          letterSpacing={2}
        >{t`A LITTLE PROGRESS, EVERY DAY`}</Text>
        <Text
          fontSize={34}
          lineHeight={40}
          fontWeight="700"
          letterSpacing={-1}
        >{t`Make space for today.`}</Text>
        <Text color={colors.muted} lineHeight={23}>{t`One thing at a time. You've got this.`}</Text>
      </YStack>
      <Card>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={21} fontWeight="700">{t`Your tasks`}</Text>
          <Text
            testID="task-progress"
            color={colors.accent}
            fontSize={13}
            fontWeight="600"
            style={{ fontVariant: ['tabular-nums'] }}
          >{t`${complete} of ${total} done`}</Text>
        </XStack>
        <Field
          label={t`What's on your mind?`}
          testID="task-input"
          value={title}
          onChangeText={setTitle}
          placeholder={t`Add a small next step…`}
          maxLength={160}
          editable={!mutationPending}
          returnKeyType="done"
          onSubmitEditing={submitTask}
        />
        <Action testID="add-task-button" disabled={mutationPending} onPress={submitTask}>
          {add.isPending ? t`Adding…` : t`Add task`}
        </Action>
        <Notice>
          {validation ?? (taskError ? t`That change didn't save. Please try again.` : null)}
        </Notice>
        {tasks.isPending ? (
          <ActivityIndicator accessibilityLabel={t`Loading tasks`} color={colors.accent} />
        ) : tasks.isError ? (
          <YStack gap={12}>
            <Notice>{t`We couldn't load your tasks.`}</Notice>
            <Action
              secondary
              onPress={() => {
                void tasks.refetch();
              }}
            >{t`Try again`}</Action>
          </YStack>
        ) : total === 0 ? (
          <YStack paddingVertical={28} gap={8} alignItems="center">
            <YStack
              width={52}
              height={52}
              backgroundColor={colors.accentSoft}
              borderRadius={18}
              alignItems="center"
              justifyContent="center"
              marginBottom={8}
            >
              <Text fontSize={25} color={colors.accent}>
                ✓
              </Text>
            </YStack>
            <Text testID="tasks-empty" fontSize={17} fontWeight="600">{t`A fresh start`}</Text>
            <Text
              color={colors.muted}
              fontSize={14}
              textAlign="center"
              lineHeight={21}
            >{t`Nothing here yet. Add your first task above.`}</Text>
          </YStack>
        ) : (
          <YStack gap={4}>
            {tasks.data?.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                pending={mutationPending}
                onToggle={() => {
                  toggle.reset();
                  remove.reset();
                  toggle.mutate(task);
                }}
                onDelete={() => {
                  toggle.reset();
                  remove.reset();
                  remove.mutate(task.id);
                }}
              />
            ))}
          </YStack>
        )}
      </Card>
      <Card>
        <Text fontSize={21} fontWeight="700">{t`Your profile`}</Text>
        <Text fontSize={13} color={colors.muted}>
          {user.email}
        </Text>
        {profile.isPending ? (
          <ActivityIndicator accessibilityLabel={t`Loading profile`} color={colors.accent} />
        ) : profile.isError ? (
          <YStack gap={12}>
            <Notice>{t`We couldn't load your profile.`}</Notice>
            <Action
              secondary
              onPress={() => {
                void profile.refetch();
              }}
            >{t`Try again`}</Action>
          </YStack>
        ) : (
          <ProfileForm key={profile.data.id} profile={profile.data} client={client} />
        )}
      </Card>
      <Notice>{logout.isError ? t`We couldn't sign you out. Please try again.` : null}</Notice>
      <Action
        secondary
        testID="sign-out-button"
        disabled={logout.isPending || mutationPending}
        onPress={() => logout.mutate()}
      >
        {logout.isPending ? t`Signing out…` : t`Sign out`}
      </Action>
      <Text
        fontSize={12}
        color={colors.muted}
        textAlign="center"
      >{t`A quieter place to get things done.`}</Text>
    </YStack>
  );
}

function TaskRow({
  task,
  pending,
  onToggle,
  onDelete,
}: {
  task: Task;
  pending: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { t } = useLingui();
  return (
    <XStack
      testID="task-row"
      gap={4}
      alignItems="center"
      borderBottomWidth={1}
      borderBottomColor={colors.border}
      paddingVertical={6}
    >
      <Pressable
        testID="task-toggle"
        accessibilityRole="checkbox"
        accessibilityLabel={task.title}
        accessibilityState={{ checked: task.completed, disabled: pending }}
        disabled={pending}
        onPress={onToggle}
        style={{ minHeight: 48, width: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <YStack
          width={24}
          height={24}
          borderRadius={8}
          borderWidth={task.completed ? 0 : 1.5}
          borderColor={colors.border}
          backgroundColor={task.completed ? colors.accent : 'white'}
          alignItems="center"
          justifyContent="center"
        >
          {task.completed ? (
            <Text color="white" fontWeight="700">
              ✓
            </Text>
          ) : null}
        </YStack>
      </Pressable>
      <Text
        flex={1}
        fontSize={15}
        lineHeight={22}
        color={task.completed ? colors.muted : colors.ink}
        textDecorationLine={task.completed ? 'line-through' : 'none'}
      >
        {task.title}
      </Text>
      <Pressable
        testID="task-delete"
        accessibilityRole="button"
        accessibilityLabel={t`Delete task: ${task.title}`}
        disabled={pending}
        onPress={onDelete}
        style={{ width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text color={colors.muted} fontSize={22}>
          ×
        </Text>
      </Pressable>
    </XStack>
  );
}

function ProfileForm({ profile, client }: { profile: Profile; client: AppClient }) {
  const { t } = useLingui();
  const cache = useQueryClient();
  // Editable draft, intentionally initialized once per keyed account. Background
  // profile refetches must not overwrite an unsaved name while the user types.
  const [name, setName] = useState(profile.display_name);
  const [validation, setValidation] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (display_name: string) => updateProfile(client, { display_name }),
    onSuccess: () => cache.invalidateQueries({ queryKey: ['profile', profile.id] }),
  });
  function submit() {
    if (save.isPending) return;
    const result = safeParse(profileInputSchema, { display_name: name });
    if (!result.success) {
      setValidation(t`Use a name between 1 and 80 characters.`);
      return;
    }
    Keyboard.dismiss();
    setValidation(null);
    save.mutate(result.output.display_name);
  }
  return (
    <YStack gap={16}>
      <Field
        label={t`Display name`}
        testID="profile-name-input"
        value={name}
        onChangeText={(value) => {
          setName(value);
          save.reset();
        }}
        maxLength={80}
        editable={!save.isPending}
        autoComplete="name"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Notice>
        {validation ?? (save.isError ? t`Your profile didn't save. Please try again.` : null)}
      </Notice>
      <Notice success>{save.isSuccess ? t`Profile saved.` : null}</Notice>
      <Action secondary testID="save-profile-button" disabled={save.isPending} onPress={submit}>
        {save.isPending ? t`Saving…` : t`Save profile`}
      </Action>
    </YStack>
  );
}
