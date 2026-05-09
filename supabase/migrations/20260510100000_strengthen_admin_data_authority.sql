-- Strengthen Admin IT authority queries for school data control.
-- Non-destructive: adds indexes only; application/server validation enforces rules.

create index if not exists idx_classes_homeroom_authority
  on public.classes (organization_id, academic_year_id, wali_kelas_id)
  where is_active = true and wali_kelas_id is not null;

create index if not exists idx_class_schedules_teacher_subject_authority
  on public.class_schedules (organization_id, subject_id, teacher_id, academic_year_id)
  where is_active = true;

create index if not exists idx_enrollments_active_student_year
  on public.enrollments (organization_id, student_id, academic_year_id)
  where status = 'ACTIVE';

create index if not exists idx_subject_teachers_org_subject_teacher
  on public.subject_teachers (organization_id, subject_id, teacher_id);
