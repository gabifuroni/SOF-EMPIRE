
-- Inserir usuários de demonstração
-- Primeiro vamos verificar se já existem e deletar se necessário
DELETE FROM auth.users WHERE email IN ('admin@gestao.com', 'profissional@salon.com');

-- Criar usuário admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@gestao.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_profissional_ou_salao": "Administrador"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar usuário profissional
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'profissional@salon.com',
  crypt('profissional123', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_profissional_ou_salao": "Profissional Demo"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Atualizar o perfil do admin para ter role 'admin'
UPDATE public.profiles 
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@gestao.com');
