-- Local dev seed data, applied on `pnpm db:reset`.

-- Local-only admin account for testing the exam builder. Never seed this into a hosted project.
-- Login: admin@toeco.test / Toeco-admin-7eb1d03f1
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-00000000ad01', 'authenticated', 'authenticated',
  'admin@toeco.test', extensions.crypt('Toeco-admin-7eb1d03f1', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}', '{"full_name": "Admin Test"}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), 'a0000000-0000-4000-8000-00000000ad01', 'a0000000-0000-4000-8000-00000000ad01', 'email',
  '{"sub": "a0000000-0000-4000-8000-00000000ad01", "email": "admin@toeco.test", "email_verified": true}', now(), now(), now()
);

update public.profiles set role = 'admin' where id = 'a0000000-0000-4000-8000-00000000ad01';

-- Local-only student account (default role) for testing role-gated pages. Never seed this into a hosted project.
-- Login: student@toeco.test / Toeco-student-4c2e9a17
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000005701', 'authenticated', 'authenticated',
  'student@toeco.test', extensions.crypt('Toeco-student-4c2e9a17', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}', '{"full_name": "Student Test"}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), 'a0000000-0000-4000-8000-000000005701', 'a0000000-0000-4000-8000-000000005701', 'email',
  '{"sub": "a0000000-0000-4000-8000-000000005701", "email": "student@toeco.test", "email_verified": true}', now(), now(), now()
);
