-- Persist self-service profile settings for role-specific settings pages.

alter table public.profiles
  add column if not exists phone text,
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb;

alter table public.profiles
  alter column notification_preferences set default '{}'::jsonb;

update public.profiles
set notification_preferences = '{}'::jsonb
where notification_preferences is null
  or jsonb_typeof(notification_preferences) <> 'object';

alter table public.profiles
  alter column notification_preferences set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_notification_preferences_is_object'
  ) then
    alter table public.profiles
      add constraint profiles_notification_preferences_is_object
      check (jsonb_typeof(notification_preferences) = 'object');
  end if;
end $$;

comment on column public.profiles.phone is
  'Self-service contact phone number shown on role settings pages.';

comment on column public.profiles.notification_preferences is
  'Role-specific notification preference flags for settings pages.';
