-- AUI account extras (The Probe, category 15)
-- Run once in the Supabase SQL Editor for project cxulgeojkjnskdyoktkj, after
-- beta_requests.sql and chat_storage.sql. Safe to run again.

-- 744: row security review fixes ------------------------------------------------

-- A row update must also stay owned by the same user. Without "with check" a
-- signed-in user could rewrite user_id on their own row and plant data in an
-- account that has no row yet.
drop policy if exists "Users can update their own data" on public.user_data;
create policy "Users can update their own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Staff are recognised by a confirmed email address on the account itself,
-- not only by the email claim inside the sign-in token.
create or replace function public.is_aui_staff()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and email_confirmed_at is not null
      and lower(email) in ('supportaton@gmail.com', 'sdgoldstein14@gmail.com')
  );
$$;
revoke all on function public.is_aui_staff() from public;
grant execute on function public.is_aui_staff() to authenticated;

drop policy if exists "Support and owner can view all requests" on public.beta_requests;
create policy "Support and owner can view all requests"
  on public.beta_requests for select
  using (public.is_aui_staff());

drop policy if exists "Support and owner can review requests" on public.beta_requests;
create policy "Support and owner can review requests"
  on public.beta_requests for update
  using (public.is_aui_staff())
  with check (public.is_aui_staff());

-- 716: people can delete their own account ------------------------------------
-- Cascades remove their synced chats (user_data) and their requests.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- 719: is a username free? ------------------------------------------------------
create or replace function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select not exists (
    select 1
    from auth.users
    where id <> auth.uid()
      and lower(raw_user_meta_data ->> 'username') = lower(trim(p_username))
  );
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to authenticated;

-- 706: place in the Beta Lab queue ---------------------------------------------
create or replace function public.beta_waitlist_position()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with mine as (
    select min(created_at) as asked_at
    from public.beta_requests
    where user_id = auth.uid() and feature_key = 'beta_lab' and status = 'pending'
  )
  select case
    when (select asked_at from mine) is null then null
    else (
      select count(*)::integer
      from public.beta_requests
      where feature_key = 'beta_lab' and status = 'pending'
        and created_at <= (select asked_at from mine)
    )
  end;
$$;
revoke all on function public.beta_waitlist_position() from public;
grant execute on function public.beta_waitlist_position() to authenticated;

-- 707: Beta members can invite up to three friends -----------------------------
create table if not exists public.beta_invites (
  code text primary key,
  created_by uuid not null references auth.users(id) on delete cascade,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.beta_invites enable row level security;
drop policy if exists "Members see their own invites" on public.beta_invites;
create policy "Members see their own invites"
  on public.beta_invites for select
  using (auth.uid() = created_by);

create or replace function public.create_beta_invite()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
begin
  if not public.has_active_beta_access(auth.uid()) then
    raise exception 'Only Beta members can invite friends';
  end if;
  if (select count(*) from public.beta_invites where created_by = auth.uid()) >= 3 then
    raise exception 'You have used all 3 invites';
  end if;
  new_code := upper(substr(md5(gen_random_uuid()::text), 1, 8));
  insert into public.beta_invites (code, created_by) values (new_code, auth.uid());
  return new_code;
end;
$$;
revoke all on function public.create_beta_invite() from public;
grant execute on function public.create_beta_invite() to authenticated;

create or replace function public.redeem_beta_invite(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  invite public.beta_invites;
  member_email text;
begin
  if auth.uid() is null then
    return false;
  end if;
  select * into invite
  from public.beta_invites
  where code = upper(trim(p_code)) and used_by is null
  for update;
  if invite.code is null or invite.created_by = auth.uid() then
    return false;
  end if;
  select email into member_email from auth.users where id = auth.uid();
  update public.beta_invites set used_by = auth.uid(), used_at = now() where code = invite.code;
  insert into public.beta_requests (
    user_id, user_email, requester_name, feature_key, title, details,
    status, admin_note, reviewed_by, reviewed_at, access_expires_at
  ) values (
    auth.uid(), member_email, split_part(member_email, '@', 1), 'beta_lab', 'Beta Lab access',
    'Joined with an invite code from another Beta member.',
    'approved', 'Invite code ' || invite.code, 'invite', now(), now() + interval '30 days'
  );
  return true;
end;
$$;
revoke all on function public.redeem_beta_invite(text) from public;
grant execute on function public.redeem_beta_invite(text) to authenticated;
