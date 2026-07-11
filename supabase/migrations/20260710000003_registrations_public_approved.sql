-- Public pages (tournament team lists) need to show which clubs are approved
-- for a tournament. The existing registrations_select policy only allows the
-- registering club or an admin to see a row, which hides approved teams from
-- everyone else. Add a permissive policy so approved registrations are
-- publicly readable, while pending/rejected/withdrawn stay private.
create policy registrations_select_public_approved
  on public.registrations
  for select
  using (status = 'approved');
