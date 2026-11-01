create index if not exists newsletter_surveys_created_by_idx
  on public.newsletter_surveys (created_by)
  where created_by is not null;

create index if not exists newsletter_surveys_updated_by_idx
  on public.newsletter_surveys (updated_by)
  where updated_by is not null;
