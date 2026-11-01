create table public.newsletter_surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '',
  questions jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','active','closed')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_surveys_questions_array check (
    jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) <= 30
  ),
  constraint newsletter_surveys_active_has_questions check (
    status <> 'active' or jsonb_array_length(questions) > 0
  )
);

create unique index newsletter_surveys_single_active_idx
  on public.newsletter_surveys ((status))
  where status = 'active';

create index newsletter_surveys_status_updated_idx
  on public.newsletter_surveys (status, updated_at desc);

create table public.newsletter_survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.newsletter_surveys(id) on delete restrict,
  answers jsonb not null check (
    jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 24000
  ),
  submitted_at timestamptz not null default now()
);

create index newsletter_survey_responses_survey_time_idx
  on public.newsletter_survey_responses (survey_id, submitted_at desc);

alter table public.newsletter_surveys enable row level security;
alter table public.newsletter_survey_responses enable row level security;

revoke all on table public.newsletter_surveys from public, anon, authenticated;
revoke all on table public.newsletter_survey_responses from public, anon, authenticated;

grant select on table public.newsletter_surveys to anon;
grant select, insert, update, delete on table public.newsletter_surveys to authenticated;
grant insert on table public.newsletter_survey_responses to anon;
grant select on table public.newsletter_survey_responses to authenticated;

create policy "Public can read the active newsletter survey"
  on public.newsletter_surveys for select to anon
  using (status = 'active');

create policy "HR admins can read all newsletter surveys"
  on public.newsletter_surveys for select to authenticated
  using (exists (select 1 from public.hr_admins a where a.user_id = (select auth.uid())));

create policy "HR admins can create newsletter surveys"
  on public.newsletter_surveys for insert to authenticated
  with check (exists (select 1 from public.hr_admins a where a.user_id = (select auth.uid())));

create policy "HR admins can update newsletter surveys"
  on public.newsletter_surveys for update to authenticated
  using (exists (select 1 from public.hr_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.hr_admins a where a.user_id = (select auth.uid())));

create policy "HR admins can delete newsletter surveys"
  on public.newsletter_surveys for delete to authenticated
  using (exists (select 1 from public.hr_admins a where a.user_id = (select auth.uid())));

create policy "Employees can submit answers to active surveys"
  on public.newsletter_survey_responses for insert to anon
  with check (
    exists (
      select 1 from public.newsletter_surveys s
      where s.id = survey_id and s.status = 'active'
    )
  );

create policy "HR admins can read anonymous survey responses"
  on public.newsletter_survey_responses for select to authenticated
  using (exists (select 1 from public.hr_admins a where a.user_id = (select auth.uid())));
