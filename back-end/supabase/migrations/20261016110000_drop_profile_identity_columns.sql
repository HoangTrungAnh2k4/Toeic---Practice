-- Name and avatar live only in auth.users.raw_user_meta_data (kept current by Supabase when identities
-- are linked); profiles keeps app data (role, goals, exam date). Removes the duplicated copy.

-- Undo a local-only sync trigger from an earlier draft of this change.
drop trigger if exists on_auth_user_metadata_updated on auth.users;
drop function if exists private.sync_profile_avatar();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

alter table public.profiles
  drop column full_name,
  drop column avatar_url;
