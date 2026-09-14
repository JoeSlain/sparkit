import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createAppClient,
  createTask,
  deleteTask,
  getProfile,
  listTasks,
  setTaskCompleted,
  updateProfile,
  type AppClient,
} from '@sparkit/supabase';
import { createLocalAdmin, getLocalConfig } from '../../supabase/local-config.mjs';

// These tests require the real local stack; unavailable infrastructure is a failure, not a skip.
const config = getLocalConfig();
const admin = createLocalAdmin(config);
const alice = createAppClient({ ...config, persistSession: false });
const bob = createAppClient({ ...config, persistSession: false });
const anon = createAppClient({ ...config, persistSession: false });
const accounts: { id: string; email: string; password: string; client: AppClient }[] = [];
const uploaded: string[] = [];

beforeAll(async () => {
  for (const [name, client] of [
    ['alice', alice],
    ['bob', bob],
  ] as const) {
    const email = `integration-${name}-${randomUUID()}@example.test`;
    const password = `Local-${randomUUID()}!`;
    const result = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (result.error) throw result.error;
    accounts.push({ id: result.data.user.id, email, password, client });
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
});

afterAll(async () => {
  if (uploaded.length) {
    const { error } = await admin.storage.from('user-files').remove(uploaded);
    if (error) throw error;
  }
  for (const { id, client } of accounts) {
    await client.auth.signOut();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw error;
  }
});

describe('real Supabase Auth + private data', () => {
  it('creates the profile on signup and persists an allowed profile update', async () => {
    expect((await getProfile(alice)).id).toBe(accounts[0]!.id);
    expect(
      (await updateProfile(alice, { display_name: '  Alice Integration  ' })).display_name,
    ).toBe('Alice Integration');
    expect((await getProfile(alice)).display_name).toBe('Alice Integration');
    const { data, error } = await bob.from('profiles').select('*').eq('id', accounts[0]!.id);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('persists task create/toggle/delete and isolates the second account', async () => {
    const task = await createTask(alice, { title: '  Persistent private task  ' });
    expect(task.title).toBe('Persistent private task');
    expect(task.completed).toBe(false);
    expect((await listTasks(alice)).map((item) => item.id)).toContain(task.id);
    expect((await listTasks(bob)).map((item) => item.id)).not.toContain(task.id);
    await expect(setTaskCompleted(bob, { id: task.id, completed: true })).rejects.toBeDefined();
    await expect(deleteTask(bob, task.id)).rejects.toBeDefined();
    expect((await setTaskCompleted(alice, { id: task.id, completed: true })).completed).toBe(true);
    await deleteTask(alice, task.id);
    expect((await listTasks(alice)).map((item) => item.id)).not.toContain(task.id);
  });

  it('rejects direct API owner spoofing and anonymous reads', async () => {
    const { error } = await bob
      .from('tasks')
      .insert({ user_id: accounts[0]!.id, title: 'Spoofed' });
    expect(error).not.toBeNull();
    await expect(listTasks(anon)).rejects.toBeDefined();
    const invalid = await alice.from('tasks').insert({ user_id: accounts[0]!.id, title: '   ' });
    expect(invalid.error?.code).toBe('23514');
  });

  it('refreshes an authenticated session and rejects it after logout', async () => {
    const { data: session, error } = await alice.auth.refreshSession();
    expect(error).toBeNull();
    expect(session.user?.id).toBe(accounts[0]!.id);
    await alice.auth.signOut();
    await expect(getProfile(alice)).rejects.toBeDefined();
    const result = await alice.auth.signInWithPassword(accounts[0]!);
    expect(result.error).toBeNull();
  });

  it('enforces private Storage paths through real upload/download APIs', async () => {
    const file = `${accounts[0]!.id}/${randomUUID()}.txt`;
    const result = await alice.storage
      .from('user-files')
      .upload(file, new Blob(['private fixture'], { type: 'text/plain' }));
    if (result.error) throw result.error;
    uploaded.push(file);
    const own = await alice.storage.from('user-files').download(file);
    expect(own.error).toBeNull();
    expect(await own.data?.text()).toBe('private fixture');
    expect((await bob.storage.from('user-files').download(file)).error).not.toBeNull();
    expect((await anon.storage.from('user-files').download(file)).error).not.toBeNull();
    const forbidden = await bob.storage
      .from('user-files')
      .upload(
        `${accounts[0]!.id}/forbidden-${randomUUID()}.txt`,
        new Blob(['no'], { type: 'text/plain' }),
      );
    expect(forbidden.error).not.toBeNull();
    const deletion = await bob.storage.from('user-files').remove([file]);
    // Storage can intentionally hide whether an inaccessible object exists.
    expect(deletion.error !== null || deletion.data?.length === 0).toBe(true);
    expect((await alice.storage.from('user-files').download(file)).error).toBeNull();
  });
});
