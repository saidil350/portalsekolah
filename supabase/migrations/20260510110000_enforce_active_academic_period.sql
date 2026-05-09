-- Enforce one active academic year and one active semester per organization.
-- Non-destructive: keeps historical rows and only normalizes duplicate active flags.

with ranked_active_years as (
  select
    id,
    row_number() over (
      partition by organization_id
      order by start_date desc nulls last, created_at desc nulls last, id desc
    ) as rank
  from public.academic_years
  where is_active = true
)
update public.academic_years ay
set is_active = false
from ranked_active_years ranked
where ay.id = ranked.id
  and ranked.rank > 1;

update public.semesters sem
set is_active = false
where sem.is_active = true
  and not exists (
    select 1
    from public.academic_years ay
    where ay.id = sem.academic_year_id
      and ay.organization_id = sem.organization_id
      and ay.is_active = true
  );

with ranked_active_semesters as (
  select
    id,
    row_number() over (
      partition by organization_id
      order by start_date desc nulls last, semester_number desc nulls last, created_at desc nulls last, id desc
    ) as rank
  from public.semesters
  where is_active = true
)
update public.semesters sem
set is_active = false
from ranked_active_semesters ranked
where sem.id = ranked.id
  and ranked.rank > 1;

create unique index if not exists idx_academic_years_one_active_per_org
  on public.academic_years (organization_id)
  where is_active = true;

create unique index if not exists idx_semesters_one_active_per_org
  on public.semesters (organization_id)
  where is_active = true;

create index if not exists idx_semesters_active_year
  on public.semesters (organization_id, academic_year_id, is_active);

create index if not exists idx_classes_period
  on public.classes (organization_id, academic_year_id, semester_id);

create index if not exists idx_enrollments_period_active
  on public.enrollments (organization_id, academic_year_id, status)
  where status = 'ACTIVE';

create index if not exists idx_class_schedules_period_active
  on public.class_schedules (organization_id, academic_year_id, semester, is_active)
  where is_active = true;

create or replace function public.enforce_active_academic_period()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'academic_years' and new.is_active = true then
    update public.academic_years
    set is_active = false
    where organization_id = new.organization_id
      and id <> new.id
      and is_active = true;

    update public.semesters
    set is_active = false
    where organization_id = new.organization_id
      and academic_year_id <> new.id
      and is_active = true;
  end if;

  if tg_table_name = 'semesters' and new.is_active = true then
    if not exists (
      select 1
      from public.academic_years ay
      where ay.id = new.academic_year_id
        and ay.organization_id = new.organization_id
        and ay.is_active = true
    ) then
      raise exception 'Semester aktif harus berada di tahun ajaran aktif';
    end if;

    update public.semesters
    set is_active = false
    where organization_id = new.organization_id
      and id <> new.id
      and is_active = true;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_academic_years_active_period on public.academic_years;
create trigger trg_academic_years_active_period
  before insert or update of is_active on public.academic_years
  for each row
  execute function public.enforce_active_academic_period();

drop trigger if exists trg_semesters_active_period on public.semesters;
create trigger trg_semesters_active_period
  before insert or update of is_active, academic_year_id on public.semesters
  for each row
  execute function public.enforce_active_academic_period();
