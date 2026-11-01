alter table public.newsletter_survey_responses
  add column if not exists respondent_name text,
  add column if not exists respondent_email text;

alter table public.newsletter_survey_responses
  add constraint newsletter_survey_response_identity_pair_check
  check (
    (respondent_name is null and respondent_email is null)
    or (
      length(trim(respondent_name)) between 2 and 120
      and length(trim(respondent_email)) between 3 and 254
      and respondent_email = lower(trim(respondent_email))
      and respondent_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$'
    )
  );

create unique index newsletter_survey_responses_unique_email_idx
  on public.newsletter_survey_responses (survey_id, respondent_email)
  where respondent_email is not null;

drop policy if exists "Employees can submit answers to active surveys"
  on public.newsletter_survey_responses;

create policy "Employees can submit identified answers to active surveys"
  on public.newsletter_survey_responses
  for insert
  to anon
  with check (
    length(trim(respondent_name)) between 2 and 120
    and respondent_email = lower(trim(respondent_email))
    and respondent_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$'
    and exists (
      select 1 from public.newsletter_surveys s
      where s.id = survey_id and s.status = 'active'
    )
  );

drop policy if exists "HR admins can read anonymous survey responses"
  on public.newsletter_survey_responses;

create policy "HR admins can read identified survey responses"
  on public.newsletter_survey_responses
  for select
  to authenticated
  using (
    exists (select 1 from public.hr_admins a where a.user_id = (select auth.uid()))
  );
