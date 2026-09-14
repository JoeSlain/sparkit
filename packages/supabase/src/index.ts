import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from '@supabase/supabase-js';
import { parse } from 'valibot';
import {
  profileInputSchema,
  taskInputSchema,
  type ProfileInput,
  type TaskInput,
} from '@sparkit/validation';
import type { Database } from './database.types';

export type { Database } from './database.types';
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AppClient = SupabaseClient<Database>;
type AuthOptions = NonNullable<SupabaseClientOptions<'public'>['auth']>;
export type AppClientOptions = {
  url: string;
  publishableKey: string;
  storage?: AuthOptions['storage'];
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
};

/** Only use a publishable/legacy anon key. Never pass server secrets to this package. */
export function createAppClient(options: AppClientOptions): AppClient {
  const url = new URL(options.url);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('Supabase URL must use HTTP or HTTPS.');
  if (!options.publishableKey.trim()) throw new Error('A Supabase publishable key is required.');
  if (options.publishableKey.startsWith('sb_secret_'))
    throw new Error('A server secret cannot be used by a public client.');
  return createClient<Database>(options.url, options.publishableKey, {
    auth: {
      storage: options.storage,
      persistSession: options.persistSession ?? true,
      detectSessionInUrl: options.detectSessionInUrl ?? false,
      autoRefreshToken: true,
    },
  });
}

async function requireUser(client: AppClient) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in to continue.');
  return data.user;
}

export async function listTasks(client: AppClient): Promise<Task[]> {
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTask(client: AppClient, input: TaskInput): Promise<Task> {
  const values = parse(taskInputSchema, input);
  const user = await requireUser(client);
  const { data, error } = await client
    .from('tasks')
    .insert({ ...values, user_id: user.id })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function setTaskCompleted(
  client: AppClient,
  input: { id: string; completed: boolean },
): Promise<Task> {
  const { data, error } = await client
    .from('tasks')
    .update({ completed: input.completed })
    .eq('id', input.id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(client: AppClient, id: string): Promise<void> {
  const { error } = await client.from('tasks').delete().eq('id', id).select('id').single();
  if (error) throw error;
}

export async function getProfile(client: AppClient): Promise<Profile> {
  const user = await requireUser(client);
  const { data, error } = await client.from('profiles').select('*').eq('id', user.id).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(client: AppClient, input: ProfileInput): Promise<Profile> {
  const values = parse(profileInputSchema, input);
  const user = await requireUser(client);
  const { data, error } = await client
    .from('profiles')
    .update(values)
    .eq('id', user.id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
