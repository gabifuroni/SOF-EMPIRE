-- Adicionar campos necessários à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nome_salao TEXT,
ADD COLUMN IF NOT EXISTS descricao_salao TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS foto_perfil TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_cidade ON public.profiles(cidade);
CREATE INDEX IF NOT EXISTS idx_profiles_estado ON public.profiles(estado);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
