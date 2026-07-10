-- ============================================================
-- Harden RLS helper functions: fix mutable search_path, and move
-- SECURITY DEFINER helpers out of the PostgREST-exposed `public`
-- schema into a `private` schema so they aren't callable as
-- public RPC endpoints (Supabase advisor: anon/authenticated
-- security_definer_function_executable).
-- ============================================================

create schema if not exists private;

alter function public.set_updated_at() set search_path = public;

-- ---- drop policies that depend on the functions being moved ----
drop policy clubs_admin_write on clubs;
drop policy tournaments_admin_write on tournaments;
drop policy matches_admin_write on matches;
drop policy news_admin_write on news;
drop policy players_write_own_club_or_admin on players;
drop policy officials_write_own_club_or_admin on officials;
drop policy stats_write_own_club_or_admin on player_match_stats;
drop policy registrations_select on registrations;
drop policy registrations_insert on registrations;
drop policy registrations_update on registrations;
drop policy registrations_delete_admin on registrations;
drop policy payments_select on payments;
drop policy payments_admin_write on payments;
drop policy users_select_own_or_admin on users;
drop policy users_update_own_or_admin on users;
drop policy users_insert_admin on users;
drop policy users_delete_admin on users;

drop trigger trg_handle_new_auth_user on auth.users;
drop function public.handle_new_auth_user();
drop function public.is_admin();
drop function public.my_club_id();

-- ---- recreate in the private (non-exposed) schema ----
create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into users (auth_user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'user'
  )
  on conflict (email) do update set auth_user_id = excluded.auth_user_id;
  return new;
end;
$$;

create trigger trg_handle_new_auth_user
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from users u
    where u.auth_user_id = auth.uid()
      and u.role in ('admin', 'technical_admin')
  );
$$;

create function private.my_club_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select u.club_id from users u
  where u.auth_user_id = auth.uid()
    and u.role = 'club_manager'
  limit 1;
$$;

-- ---- recreate policies pointing at the relocated functions ----
create policy clubs_admin_write on clubs for all using (private.is_admin()) with check (private.is_admin());
create policy tournaments_admin_write on tournaments for all using (private.is_admin()) with check (private.is_admin());
create policy matches_admin_write on matches for all using (private.is_admin()) with check (private.is_admin());
create policy news_admin_write on news for all using (private.is_admin()) with check (private.is_admin());

create policy players_write_own_club_or_admin on players for all
  using (club_id = private.my_club_id() or private.is_admin())
  with check (club_id = private.my_club_id() or private.is_admin());

create policy officials_write_own_club_or_admin on officials for all
  using (club_id = private.my_club_id() or private.is_admin())
  with check (club_id = private.my_club_id() or private.is_admin());

create policy stats_write_own_club_or_admin on player_match_stats for all
  using (
    exists (select 1 from players p where p.player_id = player_match_stats.player_id
            and (p.club_id = private.my_club_id() or private.is_admin()))
  )
  with check (
    exists (select 1 from players p where p.player_id = player_match_stats.player_id
            and (p.club_id = private.my_club_id() or private.is_admin()))
  );

create policy registrations_select on registrations for select
  using (club_id = private.my_club_id() or private.is_admin());
create policy registrations_insert on registrations for insert
  with check (club_id = private.my_club_id());
create policy registrations_update on registrations for update
  using (club_id = private.my_club_id() or private.is_admin())
  with check (private.is_admin() or (club_id = private.my_club_id() and status = 'withdrawn'));
create policy registrations_delete_admin on registrations for delete
  using (private.is_admin());

create policy payments_select on payments for select
  using (club_id = private.my_club_id() or private.is_admin());
create policy payments_admin_write on payments for all
  using (private.is_admin()) with check (private.is_admin());

create policy users_select_own_or_admin on users for select
  using (auth_user_id = auth.uid() or private.is_admin());
create policy users_update_own_or_admin on users for update
  using (auth_user_id = auth.uid() or private.is_admin())
  with check (auth_user_id = auth.uid() or private.is_admin());
create policy users_insert_admin on users for insert
  with check (private.is_admin());
create policy users_delete_admin on users for delete
  using (private.is_admin());
