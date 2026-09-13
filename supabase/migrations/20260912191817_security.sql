-- SQL-owned Supabase integration: policies, grants, Auth lifecycle and Storage.
-- Apply after the generated initial table migration, using Supabase CLI only.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.profiles
  add constraint profiles_id_auth_users_fk foreign key (id) references auth.users(id) on delete cascade;

create function private.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.touch_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function private.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
revoke all on table public.profiles, public.tasks from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;
grant select, delete on table public.tasks to authenticated;
grant insert (user_id, title) on table public.tasks to authenticated;
grant update (title, completed) on table public.tasks to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy tasks_select_own on public.tasks for select to authenticated
  using ((select auth.uid()) = user_id);
create policy tasks_insert_own on public.tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy tasks_update_own on public.tasks for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy tasks_delete_own on public.tasks for delete to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-files', 'user-files', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']);
create policy user_files_select_own on storage.objects for select to authenticated
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy user_files_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy user_files_update_own on storage.objects for update to authenticated
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy user_files_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
