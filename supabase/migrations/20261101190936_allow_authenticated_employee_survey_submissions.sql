grant insert on table public.newsletter_survey_responses to authenticated;

drop policy if exists "Employees can submit identified answers to active surveys"
  on public.newsletter_survey_responses;

create policy "Employees can submit identified answers to active surveys"
  on public.newsletter_survey_responses
  for insert
  to anon, authenticated
  with check (
    length(trim(respondent_name)) between 2 and 120
    and respondent_email = lower(trim(respondent_email))
    and respondent_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$'
    and exists (
      select 1 from public.newsletter_surveys s
      where s.id = survey_id and s.status = 'active'
    )
  );