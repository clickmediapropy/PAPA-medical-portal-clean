-- Storage bucket for medical documents with basic access policies

insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', false)
on conflict (id) do update set name = excluded.name;

-- Restrict storage objects to owners by default; service role can override for shared access.
create policy "Medical docs readable by owner" on storage.objects
  for select using (
    bucket_id = 'medical-documents' and coalesce(owner, auth.uid()) = auth.uid()
  );

create policy "Medical docs insert by owner" on storage.objects
  for insert with check (
    bucket_id = 'medical-documents' and coalesce(owner, auth.uid()) = auth.uid()
  );

create policy "Medical docs update by owner" on storage.objects
  for update using (
    bucket_id = 'medical-documents' and coalesce(owner, auth.uid()) = auth.uid()
  ) with check (
    bucket_id = 'medical-documents' and coalesce(owner, auth.uid()) = auth.uid()
  );

create policy "Medical docs delete by owner" on storage.objects
  for delete using (
    bucket_id = 'medical-documents' and coalesce(owner, auth.uid()) = auth.uid()
  );
