import { taskInputSchema } from '@sparkit/validation';
import { safeParse } from 'valibot';
import { useState, type FormEvent } from 'react';
import { Trans, Plural, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { colors } from '@sparkit/tokens';
import {
  createTask,
  deleteTask,
  listTasks,
  setTaskCompleted,
  type AppClient,
  type Task,
} from '@sparkit/supabase';
import { taskKey } from '../lib/query';
import { Button, Card, Eyebrow, Input, Notice } from './ui';

function TaskRow({ task, client, userId }: { task: Task; client: AppClient; userId: string }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const key = taskKey(userId);
  const toggle = useMutation({
    mutationFn: () => setTaskCompleted(client, { id: task.id, completed: !task.completed }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Task[]>(key);
      queryClient.setQueryData<Task[]>(key, (tasks = []) =>
        tasks.map((row) => (row.id === task.id ? { ...row, completed: !row.completed } : row)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteTask(client, task.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: key });
    },
  });
  const pending = toggle.isPending || remove.isPending;
  return (
    <li data-testid="task-row" aria-busy={pending} style={{ listStyle: 'none' }}>
      <YStack
        gap={8}
        paddingVertical={12}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
        opacity={task.completed ? 0.65 : 1}
      >
        <XStack alignItems="center" justifyContent="space-between" gap={12}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <input
              type="checkbox"
              data-testid="task-toggle"
              checked={task.completed}
              disabled={pending}
              onChange={() => toggle.mutate()}
              style={{ width: 18, height: 18 }}
            />
            <Text
              fontSize={15}
              color={colors.ink}
              textDecorationLine={task.completed ? 'line-through' : 'none'}
            >
              {task.title}
            </Text>
          </label>
          <Button
            data-testid="task-delete"
            variant="ghost"
            disabled={pending}
            aria-label={t`Delete task: ${task.title}`}
            onClick={() => remove.mutate()}
            style={{ minHeight: 36, paddingInline: 8 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </XStack>
        {(toggle.isError || remove.isError) && (
          <Notice error>
            <Trans>That change didn't save. Please try again.</Trans>
          </Notice>
        )}
      </YStack>
    </li>
  );
}

export function Tasks({ client, userId }: { client: AppClient; userId: string }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [validation, setValidation] = useState('');
  const tasks = useQuery({ queryKey: taskKey(userId), queryFn: () => listTasks(client) });
  const add = useMutation({
    mutationFn: (title: string) => createTask(client, { title }),
    onSuccess: async () => {
      setTitle('');
      await queryClient.invalidateQueries({ queryKey: taskKey(userId) });
    },
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (add.isPending) return;
    const parsed = safeParse(taskInputSchema, { title });
    if (!parsed.success) {
      setValidation(t`Write a task between 1 and 160 characters.`);
      return;
    }
    setValidation('');
    add.mutate(parsed.output.title);
  }
  const completed = tasks.data?.filter((task) => task.completed).length ?? 0;
  const total = tasks.data?.length ?? 0;
  return (
    <section aria-labelledby="tasks-title">
      <Card flex={1}>
        <XStack justifyContent="space-between" alignItems="flex-start" gap={12}>
          <YStack gap={6}>
            <Eyebrow>
              <Trans>One step at a time</Trans>
            </Eyebrow>
            <Text id="tasks-title" fontSize={24} fontWeight="600" color={colors.ink}>
              <Trans>Your tasks</Trans>
            </Text>
          </YStack>
          {tasks.data ? (
            <Text
              fontSize={13}
              fontWeight="600"
              color={colors.accent}
              backgroundColor={colors.accentSoft}
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius={999}
            >
              <Plural value={total} one="# task" other="# tasks" />
            </Text>
          ) : null}
        </XStack>
        <form onSubmit={submit} aria-busy={add.isPending}>
          <XStack gap={12} flexWrap="wrap">
            <label htmlFor="task" className="sr-only">
              <Trans>New task</Trans>
            </label>
            <YStack flex={1} minWidth={200}>
              <Input
                id="task"
                data-testid="task-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={160}
                placeholder={t`What would you like to get done?`}
                disabled={add.isPending}
                aria-invalid={!!validation}
                aria-describedby={validation ? 'task-validation' : undefined}
              />
            </YStack>
            <Button data-testid="add-task-button" type="submit" disabled={add.isPending}>
              <span aria-hidden="true">＋</span>
              <span>{add.isPending ? <Trans>Adding…</Trans> : <Trans>Add task</Trans>}</span>
            </Button>
          </XStack>
        </form>
        {validation ? (
          <Notice id="task-validation" error>
            {validation}
          </Notice>
        ) : null}
        {add.isError ? (
          <Notice error>
            <Trans>Your task couldn't be added. Please try again.</Trans>
          </Notice>
        ) : null}
        {tasks.isPending ? (
          <Text role="status" color={colors.muted}>
            <Trans>Loading your tasks…</Trans>
          </Text>
        ) : tasks.isError ? (
          <YStack gap={12}>
            <Notice error>
              <Trans>We couldn't load your tasks.</Trans>
            </Notice>
            <Button variant="secondary" onClick={() => void tasks.refetch()}>
              <Trans>Try again</Trans>
            </Button>
          </YStack>
        ) : total === 0 ? (
          <YStack gap={8} alignItems="flex-start" paddingVertical={12}>
            <Text fontSize={28} aria-hidden>
              ✓
            </Text>
            <Text fontSize={18} fontWeight="600" color={colors.ink}>
              <Trans>A fresh start.</Trans>
            </Text>
            <Text color={colors.muted}>
              <Trans>Add your first task. Small steps make good things happen.</Trans>
            </Text>
          </YStack>
        ) : (
          <YStack gap={4}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tasks.data.map((task) => (
                <TaskRow key={task.id} task={task} client={client} userId={userId} />
              ))}
            </ul>
            <XStack justifyContent="space-between" alignItems="center" gap={12} paddingTop={8}>
              <Text fontSize={13} color={colors.muted}>
                <Trans>
                  {completed} of {total} completed
                </Trans>
              </Text>
              <progress value={completed} max={total} aria-label={t`Task completion`} />
            </XStack>
          </YStack>
        )}
      </Card>
    </section>
  );
}
