drop policy if exists "Public can read the active newsletter survey"
  on public.newsletter_surveys;

create policy "Public can read the active newsletter survey"
  on public.newsletter_surveys
  for select
  to anon, authenticated
  using (status = 'active');
