-- Adjust storage policies to support signed uploads and authenticated access

drop policy if exists "Medical docs readable by owner" on storage.objects;
drop policy if exists "Medical docs insert by owner" on storage.objects;
drop policy if exists "Medical docs update by owner" on storage.objects;
drop policy if exists "Medical docs delete by owner" on storage.objects;

create policy "Medical docs upload via signed url" on storage.objects
  for insert with check (
    bucket_id = 'medical-documents' and auth.role() = 'anon'
  );

create policy "Medical docs readable by authenticated" on storage.objects
  for select using (
    bucket_id = 'medical-documents' and auth.role() = 'authenticated'
  );

create policy "Medical docs managed by service" on storage.objects
  for all using (
    bucket_id = 'medical-documents' and auth.role() = 'service_role'
  ) with check (
    bucket_id = 'medical-documents' and auth.role() = 'service_role'
  );
