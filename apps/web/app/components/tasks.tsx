import { taskInputSchema } from '@agency/validation';
import { safeParse } from 'valibot';
import { useState, type FormEvent } from 'react';
import { Trans, Plural, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTask,
  deleteTask,
  listTasks,
  setTaskCompleted,
  type AppClient,
  type Task,
} from '@agency/supabase';
import { taskKey } from '../lib/query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Notice } from './ui/notice';

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
    <li
      className={`task-row ${task.completed ? 'task-done' : ''}`}
      data-testid="task-row"
      aria-busy={pending}
    >
      <div className="task-main">
        <label className="task-label">
          <input
            className="task-checkbox"
            type="checkbox"
            data-testid="task-toggle"
            checked={task.completed}
            disabled={pending}
            onChange={() => toggle.mutate()}
          />
          <span>{task.title}</span>
        </label>
        <Button
          data-testid="task-delete"
          variant="ghost"
          className="task-delete"
          disabled={pending}
          aria-label={t`Delete task: ${task.title}`}
          onClick={() => remove.mutate()}
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
      </div>
      {(toggle.isError || remove.isError) && (
        <Notice error>
          <Trans>That change didn't save. Please try again.</Trans>
        </Notice>
      )}
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
    <section className="panel tasks-panel" aria-labelledby="tasks-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">
            <Trans>One step at a time</Trans>
          </span>
          <h2 id="tasks-title">
            <Trans>Your tasks</Trans>
          </h2>
        </div>
        {tasks.data && (
          <span className="count-pill">
            <Plural value={total} one="# task" other="# tasks" />
          </span>
        )}
      </div>
      <form className="add-task-form" onSubmit={submit} aria-busy={add.isPending}>
        <label htmlFor="task" className="sr-only">
          <Trans>New task</Trans>
        </label>
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
        <Button data-testid="add-task-button" type="submit" disabled={add.isPending}>
          <span aria-hidden="true">＋</span>
          <span>{add.isPending ? <Trans>Adding…</Trans> : <Trans>Add task</Trans>}</span>
        </Button>
      </form>
      {validation && (
        <Notice id="task-validation" error>
          {validation}
        </Notice>
      )}
      {add.isError && (
        <Notice error>
          <Trans>Your task couldn't be added. Please try again.</Trans>
        </Notice>
      )}
      {tasks.isPending ? (
        <div className="loading-state" role="status">
          <span className="spinner" aria-hidden="true" />
          <Trans>Loading your tasks…</Trans>
        </div>
      ) : tasks.isError ? (
        <div className="query-error">
          <Notice error>
            <Trans>We couldn't load your tasks.</Trans>
          </Notice>
          <Button variant="secondary" onClick={() => void tasks.refetch()}>
            <Trans>Try again</Trans>
          </Button>
        </div>
      ) : total === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            ✓
          </div>
          <h3>
            <Trans>A fresh start.</Trans>
          </h3>
          <p>
            <Trans>Add your first task. Small steps make good things happen.</Trans>
          </p>
        </div>
      ) : (
        <>
          <ul className="task-list">
            {tasks.data.map((task) => (
              <TaskRow key={task.id} task={task} client={client} userId={userId} />
            ))}
          </ul>
          <div className="task-summary">
            <span>
              <Trans>
                {completed} of {total} completed
              </Trans>
            </span>
            <progress value={completed} max={total} aria-label={t`Task completion`} />
          </div>
        </>
      )}
    </section>
  );
}
