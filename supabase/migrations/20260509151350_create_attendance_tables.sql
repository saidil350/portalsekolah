create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  class_schedule_id uuid references public.class_schedules(id) on delete set null,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  attendance_date date not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'SUBMITTED')),
  submitted_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_sessions_schedule_date_unique unique (organization_id, class_schedule_id, attendance_date),
  constraint attendance_sessions_manual_date_unique unique (organization_id, class_id, subject_id, teacher_id, attendance_date)
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('PRESENT', 'LATE', 'SICK', 'PERMIT', 'ABSENT')),
  check_in_time time,
  note text,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_records_session_student_unique unique (session_id, student_id)
);

create index if not exists idx_attendance_sessions_organization_date
  on public.attendance_sessions(organization_id, attendance_date desc);
create index if not exists idx_attendance_sessions_schedule
  on public.attendance_sessions(class_schedule_id, attendance_date desc);
create index if not exists idx_attendance_sessions_teacher
  on public.attendance_sessions(teacher_id, attendance_date desc);
create index if not exists idx_attendance_sessions_class
  on public.attendance_sessions(class_id, attendance_date desc);
create index if not exists idx_attendance_records_organization_student
  on public.attendance_records(organization_id, student_id);
create index if not exists idx_attendance_records_session
  on public.attendance_records(session_id);
create index if not exists idx_attendance_records_status
  on public.attendance_records(status);

alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;

grant select, insert, update, delete on public.attendance_sessions to authenticated;
grant select, insert, update, delete on public.attendance_records to authenticated;
grant all on public.attendance_sessions to service_role;
grant all on public.attendance_records to service_role;

drop policy if exists attendance_sessions_select on public.attendance_sessions;
drop policy if exists attendance_sessions_teacher_insert on public.attendance_sessions;
drop policy if exists attendance_sessions_teacher_update on public.attendance_sessions;
drop policy if exists attendance_sessions_teacher_delete on public.attendance_sessions;
drop policy if exists attendance_sessions_service_role_all on public.attendance_sessions;

create policy attendance_sessions_select
  on public.attendance_sessions for select to authenticated
  using (
    public.is_org_member(organization_id)
    and (
      public.get_auth_role() in ('ADMIN_IT', 'KEPALA_SEKOLAH')
      or teacher_id = auth.uid()
      or exists (
        select 1
        from public.enrollments e
        where e.class_id = attendance_sessions.class_id
          and e.student_id = auth.uid()
          and e.status = 'ACTIVE'
      )
    )
  );

create policy attendance_sessions_teacher_insert
  on public.attendance_sessions for insert to authenticated
  with check (
    public.is_org_member(organization_id)
    and (
      public.is_admin_it()
      or (
        public.get_auth_role() = 'GURU'
        and teacher_id = auth.uid()
        and created_by = auth.uid()
        and exists (
          select 1
          from public.class_schedules cs
          where cs.id = class_schedule_id
            and cs.teacher_id = auth.uid()
            and cs.organization_id = attendance_sessions.organization_id
        )
      )
    )
  );

create policy attendance_sessions_teacher_update
  on public.attendance_sessions for update to authenticated
  using (
    public.is_org_member(organization_id)
    and (public.is_admin_it() or (public.get_auth_role() = 'GURU' and teacher_id = auth.uid()))
  )
  with check (
    public.is_org_member(organization_id)
    and (public.is_admin_it() or (public.get_auth_role() = 'GURU' and teacher_id = auth.uid()))
  );

create policy attendance_sessions_teacher_delete
  on public.attendance_sessions for delete to authenticated
  using (
    public.is_org_member(organization_id)
    and (public.is_admin_it() or (public.get_auth_role() = 'GURU' and teacher_id = auth.uid() and status = 'DRAFT'))
  );

create policy attendance_sessions_service_role_all
  on public.attendance_sessions for all to service_role
  using (true)
  with check (true);

drop policy if exists attendance_records_select on public.attendance_records;
drop policy if exists attendance_records_teacher_insert on public.attendance_records;
drop policy if exists attendance_records_teacher_update on public.attendance_records;
drop policy if exists attendance_records_teacher_delete on public.attendance_records;
drop policy if exists attendance_records_service_role_all on public.attendance_records;

create policy attendance_records_select
  on public.attendance_records for select to authenticated
  using (
    public.is_org_member(organization_id)
    and (
      student_id = auth.uid()
      or public.get_auth_role() in ('ADMIN_IT', 'KEPALA_SEKOLAH')
      or exists (
        select 1
        from public.attendance_sessions s
        where s.id = attendance_records.session_id
          and s.teacher_id = auth.uid()
      )
    )
  );

create policy attendance_records_teacher_insert
  on public.attendance_records for insert to authenticated
  with check (
    public.is_org_member(organization_id)
    and (
      public.is_admin_it()
      or exists (
        select 1
        from public.attendance_sessions s
        join public.enrollments e
          on e.class_id = s.class_id
          and e.student_id = attendance_records.student_id
          and e.status = 'ACTIVE'
        where s.id = attendance_records.session_id
          and s.organization_id = attendance_records.organization_id
          and s.teacher_id = auth.uid()
      )
    )
  );

create policy attendance_records_teacher_update
  on public.attendance_records for update to authenticated
  using (
    public.is_org_member(organization_id)
    and (
      public.is_admin_it()
      or exists (
        select 1
        from public.attendance_sessions s
        where s.id = attendance_records.session_id
          and s.teacher_id = auth.uid()
      )
    )
  )
  with check (
    public.is_org_member(organization_id)
    and (
      public.is_admin_it()
      or exists (
        select 1
        from public.attendance_sessions s
        where s.id = attendance_records.session_id
          and s.teacher_id = auth.uid()
      )
    )
  );

create policy attendance_records_teacher_delete
  on public.attendance_records for delete to authenticated
  using (
    public.is_org_member(organization_id)
    and (
      public.is_admin_it()
      or exists (
        select 1
        from public.attendance_sessions s
        where s.id = attendance_records.session_id
          and s.teacher_id = auth.uid()
          and s.status = 'DRAFT'
      )
    )
  );

create policy attendance_records_service_role_all
  on public.attendance_records for all to service_role
  using (true)
  with check (true);
