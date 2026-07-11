-- Lets a signed-up "user" role register their own club and become its manager
-- in one step, without needing an admin to create the club first. Lives in the
-- public schema (not private) so it's reachable via PostgREST RPC; SECURITY
-- DEFINER lets it bypass the admin-only clubs INSERT/users role-change surface
-- while enforcing its own narrow checks (must currently be a plain "user" with
-- no club already assigned).
create or replace function public.register_own_club(
  p_club_name text,
  p_state text,
  p_club_category text,
  p_manager_name text,
  p_phone text,
  p_email text,
  p_color text,
  p_logo_url text
) returns integer
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_user_id integer;
  v_current_role user_role;
  v_current_club_id integer;
  v_new_club_id integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated.';
  end if;

  select user_id, role, club_id into v_user_id, v_current_role, v_current_club_id
  from users
  where auth_user_id = auth.uid();

  if v_user_id is null then
    raise exception 'No matching user profile.';
  end if;

  if v_current_role <> 'user' or v_current_club_id is not null then
    raise exception 'You already manage a club or are not eligible to register one.';
  end if;

  if coalesce(trim(p_club_name), '') = '' or coalesce(trim(p_manager_name), '') = '' or coalesce(trim(p_state), '') = '' then
    raise exception 'Club name, manager name, and state are required.';
  end if;

  insert into clubs (club_name, state, club_category, manager_name, phone, email, color, logo_url)
  values (
    p_club_name,
    p_state,
    coalesce(nullif(p_club_category, ''), 'club'),
    p_manager_name,
    nullif(p_phone, ''),
    nullif(p_email, ''),
    coalesce(nullif(p_color, ''), '#1f6f43'),
    nullif(p_logo_url, '')
  )
  returning club_id into v_new_club_id;

  update users
  set role = 'club_manager', club_id = v_new_club_id
  where user_id = v_user_id;

  return v_new_club_id;
end;
$$;

revoke all on function public.register_own_club(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.register_own_club(text, text, text, text, text, text, text, text) to authenticated;

-- A brand-new "user" account has no club_id yet, so the existing club-logos
-- write policy (admin or my_club_id() is not null) would block them from
-- uploading a logo during registration itself. Widen writes to any
-- authenticated user; reads stay public either way.
drop policy if exists "club_logos_write" on storage.objects;
drop policy if exists "club_logos_update" on storage.objects;
drop policy if exists "club_logos_delete" on storage.objects;

create policy "club_logos_write"
  on storage.objects
  for insert
  with check (bucket_id = 'club-logos' and auth.role() = 'authenticated');

create policy "club_logos_update"
  on storage.objects
  for update
  using (bucket_id = 'club-logos' and auth.role() = 'authenticated')
  with check (bucket_id = 'club-logos' and auth.role() = 'authenticated');

create policy "club_logos_delete"
  on storage.objects
  for delete
  using (bucket_id = 'club-logos' and auth.role() = 'authenticated');
