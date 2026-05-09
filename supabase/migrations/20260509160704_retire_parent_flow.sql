-- Retire the separate parent/orang tua flow from the active product.
-- The legacy table is kept for migration compatibility, but it must not grant
-- parent-specific self-service access or become an authorization source.

do $$
declare
  policy_record record;
begin
  if to_regclass('public.parent_student_relationships') is not null then
    for policy_record in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = 'parent_student_relationships'
    loop
      execute format(
        'drop policy if exists %I on public.parent_student_relationships',
        policy_record.policyname
      );
    end loop;

    alter table public.parent_student_relationships enable row level security;

    create policy parent_student_relationships_admin_select
      on public.parent_student_relationships for select to authenticated
      using (public.is_admin_it());

    create policy parent_student_relationships_admin_insert
      on public.parent_student_relationships for insert to authenticated
      with check (public.is_admin_it());

    create policy parent_student_relationships_admin_update
      on public.parent_student_relationships for update to authenticated
      using (public.is_admin_it())
      with check (public.is_admin_it());

    create policy parent_student_relationships_admin_delete
      on public.parent_student_relationships for delete to authenticated
      using (public.is_admin_it());

    create policy parent_student_relationships_service_role_all
      on public.parent_student_relationships for all to service_role
      using (true)
      with check (true);
  end if;
end $$;
