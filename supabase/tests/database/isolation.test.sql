begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(22);

insert into auth.users (id, email) values
 ('11111111-1111-4111-8111-111111111111', 'rls-alice@example.test'),
 ('22222222-2222-4222-8222-222222222222', 'rls-bob@example.test');
insert into public.tasks (id, user_id, title) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Alice task'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Bob task');
insert into storage.objects (bucket_id, name) values
 ('user-files', '11111111-1111-4111-8111-111111111111/a.txt'),
 ('user-files', '22222222-2222-4222-8222-222222222222/b.txt');

select is((select count(*)::int from public.profiles where id in ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222')), 2, 'Auth trigger creates profiles');
select is((select public from storage.buckets where id = 'user-files'), false, 'User files bucket is private');

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
select is((select count(*)::int from public.tasks), 1, 'Alice sees only her task');
select is((select count(*)::int from public.profiles), 1, 'Alice sees only her profile');
select is((select title from public.tasks limit 1), 'Alice task', 'Own row is readable');
select lives_ok($$insert into public.tasks (user_id, title) values ('11111111-1111-4111-8111-111111111111', 'Allowed')$$, 'Own insert allowed');
select throws_ok($$insert into public.tasks (user_id, title) values ('22222222-2222-4222-8222-222222222222', 'Denied')$$, '42501', null, 'Other owner insert denied');
select throws_ok($$update public.tasks set user_id = '22222222-2222-4222-8222-222222222222' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$, '42501', null, 'Ownership column cannot be changed');
with changed as (update public.tasks set completed = true where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' returning id) select is((select count(*)::int from changed), 0, 'Other task update changes zero rows');
with deleted as (delete from public.tasks where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' returning id) select is((select count(*)::int from deleted), 0, 'Other task cannot be deleted');
select lives_ok($$update public.profiles set display_name = 'Alice' where id = '11111111-1111-4111-8111-111111111111'$$, 'Own name update allowed');
with changed as (update public.profiles set display_name = 'Intruder' where id = '22222222-2222-4222-8222-222222222222' returning id) select is((select count(*)::int from changed), 0, 'Other name update changes zero rows');
select throws_ok($$insert into public.tasks (user_id, title) values ('11111111-1111-4111-8111-111111111111', '   ')$$, '23514', null, 'Database rejects blank task');
select throws_ok($$update public.profiles set display_name = '' where id = '11111111-1111-4111-8111-111111111111'$$, '23514', null, 'Database rejects blank name');
select is((select count(*)::int from storage.objects where bucket_id = 'user-files'), 1, 'Storage lists own objects only');
select lives_ok($$insert into storage.objects (bucket_id, name) values ('user-files', '11111111-1111-4111-8111-111111111111/allowed.txt')$$, 'Own storage upload path allowed');
select throws_ok($$insert into storage.objects (bucket_id, name) values ('user-files', '22222222-2222-4222-8222-222222222222/denied.txt')$$, '42501', null, 'Other storage upload path denied');
select throws_ok($$update storage.objects set name = '22222222-2222-4222-8222-222222222222/stolen.txt' where name = '11111111-1111-4111-8111-111111111111/a.txt'$$, '42501', null, 'Cannot move a file to another user path');
select throws_ok($$delete from storage.objects where name = '22222222-2222-4222-8222-222222222222/b.txt'$$, '42501', null, 'Storage requires API deletion; integration tests verify delete isolation');

set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select throws_ok($$select * from public.tasks$$, '42501', null, 'Anonymous task access denied at grants');
select throws_ok($$select * from public.profiles$$, '42501', null, 'Anonymous profile access denied at grants');
select is((select count(*)::int from storage.objects where bucket_id = 'user-files'), 0, 'Anonymous storage access denied by RLS');
select * from finish();
rollback;
