-- Public bucket for admin-uploaded news cover images.
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

create policy "news_images_public_read"
  on storage.objects
  for select
  using (bucket_id = 'news-images');

create policy "news_images_admin_insert"
  on storage.objects
  for insert
  with check (bucket_id = 'news-images' and private.is_admin());

create policy "news_images_admin_update"
  on storage.objects
  for update
  using (bucket_id = 'news-images' and private.is_admin())
  with check (bucket_id = 'news-images' and private.is_admin());

create policy "news_images_admin_delete"
  on storage.objects
  for delete
  using (bucket_id = 'news-images' and private.is_admin());
