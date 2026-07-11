-- Club managers could never actually save their own club's profile (including a
-- logo) because the original clubs UPDATE policy only allowed admins. Allow a
-- manager to update their own club, matching the pattern used for players/officials.
drop policy if exists clubs_admin_update on public.clubs;

create policy clubs_update_own_or_admin
  on public.clubs
  for update
  using (club_id = private.my_club_id() or private.is_admin())
  with check (club_id = private.my_club_id() or private.is_admin());

-- Public bucket for club logos, uploaded by the club's own manager or an admin.
insert into storage.buckets (id, name, public)
values ('club-logos', 'club-logos', true)
on conflict (id) do nothing;

create policy "club_logos_public_read"
  on storage.objects
  for select
  using (bucket_id = 'club-logos');

create policy "club_logos_write"
  on storage.objects
  for insert
  with check (bucket_id = 'club-logos' and (private.is_admin() or private.my_club_id() is not null));

create policy "club_logos_update"
  on storage.objects
  for update
  using (bucket_id = 'club-logos' and (private.is_admin() or private.my_club_id() is not null))
  with check (bucket_id = 'club-logos' and (private.is_admin() or private.my_club_id() is not null));

create policy "club_logos_delete"
  on storage.objects
  for delete
  using (bucket_id = 'club-logos' and (private.is_admin() or private.my_club_id() is not null));
