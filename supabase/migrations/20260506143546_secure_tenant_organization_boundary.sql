-- Secure tenant boundary for PortalSekolah / HR School.
-- Stage 1 intentionally does not bulk-map legacy unscoped data. Existing rows
-- with null organization_id stay hidden by RLS until they are mapped explicitly.

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;

create index if not exists idx_profiles_organization_id on public.profiles(organization_id);
create index if not exists idx_profiles_organization_role on public.profiles(organization_id, role);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'academic_years',
    'semesters',
    'departments',
    'class_levels',
    'subjects',
    'rooms',
    'classes',
    'enrollments',
    'class_schedules',
    'subject_teachers',
    'teacher_ranks',
    'student_invoices',
    'attendances'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format(
        'alter table public.%I add column if not exists organization_id uuid references public.organizations(id) on delete cascade',
        table_name
      );

      execute format(
        'create index if not exists idx_%s_organization_id on public.%I(organization_id)',
        table_name,
        table_name
      );
    end if;
  end loop;
end $$;

create or replace function public.get_auth_organization_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select organization_id
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.get_auth_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_admin_it()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.get_auth_role() = 'ADMIN_IT', false);
$$;

create or replace function public.is_org_member(table_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select table_organization_id = public.get_auth_organization_id();
$$;

grant execute on function public.get_auth_organization_id() to authenticated;
grant execute on function public.get_auth_role() to authenticated;
grant execute on function public.is_admin_it() to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;

create or replace function public.prevent_profile_tenant_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role' then
    return new;
  end if;

  if auth.uid() = old.id and (
    new.role is distinct from old.role or
    new.organization_id is distinct from old.organization_id or
    new.is_active is distinct from old.is_active or
    new.status is distinct from old.status
  ) then
    raise exception 'Profile tenant and role fields cannot be changed by self-service updates';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_tenant_self_escalation on public.profiles;
create trigger prevent_profile_tenant_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_tenant_self_escalation();

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
create index if not exists idx_audit_logs_organization_created
  on public.audit_logs(organization_id, created_at desc);

do $$
declare
  table_name text;
  policy_record record;
begin
  foreach table_name in array array[
    'academic_years',
    'semesters',
    'departments',
    'class_levels',
    'subjects',
    'rooms',
    'classes',
    'enrollments',
    'class_schedules',
    'subject_teachers',
    'teacher_ranks',
    'student_invoices',
    'attendances',
    'audit_logs'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      for policy_record in
        select policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = table_name
      loop
        execute format('drop policy if exists %I on public.%I', policy_record.policyname, table_name);
      end loop;

      execute format('alter table public.%I enable row level security', table_name);
      execute format(
        'create policy %I on public.%I for select to authenticated using (public.is_org_member(organization_id))',
        table_name || '_tenant_select',
        table_name
      );
      execute format(
        'create policy %I on public.%I for insert to authenticated with check (public.is_admin_it() and public.is_org_member(organization_id))',
        table_name || '_admin_insert',
        table_name
      );
      execute format(
        'create policy %I on public.%I for update to authenticated using (public.is_admin_it() and public.is_org_member(organization_id)) with check (public.is_admin_it() and public.is_org_member(organization_id))',
        table_name || '_admin_update',
        table_name
      );
      execute format(
        'create policy %I on public.%I for delete to authenticated using (public.is_admin_it() and public.is_org_member(organization_id))',
        table_name || '_admin_delete',
        table_name
      );
      execute format(
        'create policy %I on public.%I for all to service_role using (true) with check (true)',
        table_name || '_service_role_all',
        table_name
      );
    end if;
  end loop;
end $$;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', policy_record.policyname);
  end loop;
end $$;

create policy profiles_self_select
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy profiles_tenant_select
  on public.profiles for select to authenticated
  using (organization_id = public.get_auth_organization_id());

create policy profiles_self_update
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_insert
  on public.profiles for insert to authenticated
  with check (public.is_admin_it() and organization_id = public.get_auth_organization_id());

create policy profiles_admin_update
  on public.profiles for update to authenticated
  using (public.is_admin_it() and organization_id = public.get_auth_organization_id())
  with check (public.is_admin_it() and organization_id = public.get_auth_organization_id());

create policy profiles_admin_delete
  on public.profiles for delete to authenticated
  using (public.is_admin_it() and organization_id = public.get_auth_organization_id() and id <> auth.uid());

create policy profiles_service_role_all
  on public.profiles for all to service_role
  using (true)
  with check (true);

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'organizations'
  loop
    execute format('drop policy if exists %I on public.organizations', policy_record.policyname);
  end loop;
end $$;

create policy organizations_member_select
  on public.organizations for select to authenticated
  using (id = public.get_auth_organization_id());

create policy organizations_creator_insert
  on public.organizations for insert to authenticated
  with check (created_by = auth.uid());

create policy organizations_admin_update
  on public.organizations for update to authenticated
  using (id = public.get_auth_organization_id() and public.is_admin_it())
  with check (id = public.get_auth_organization_id() and public.is_admin_it());

create policy organizations_service_role_all
  on public.organizations for all to service_role
  using (true)
  with check (true);

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'organization_settings'
  loop
    execute format('drop policy if exists %I on public.organization_settings', policy_record.policyname);
  end loop;
end $$;

create policy organization_settings_member_select
  on public.organization_settings for select to authenticated
  using (organization_id = public.get_auth_organization_id());

create policy organization_settings_admin_update
  on public.organization_settings for update to authenticated
  using (public.is_admin_it() and organization_id = public.get_auth_organization_id())
  with check (public.is_admin_it() and organization_id = public.get_auth_organization_id());

create policy organization_settings_service_role_all
  on public.organization_settings for all to service_role
  using (true)
  with check (true);
