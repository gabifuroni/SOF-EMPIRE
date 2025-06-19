-- Script para adicionar campos necessários na tabela profiles

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
    -- Adicionar campo cidade se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'cidade') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN cidade TEXT;
    END IF;
    
    -- Adicionar campo estado se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'estado') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN estado TEXT;
    END IF;
    
    -- Adicionar campo nome_salao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'nome_salao') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN nome_salao TEXT;
    END IF;
    
    -- Adicionar campo descricao_salao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'descricao_salao') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN descricao_salao TEXT;
    END IF;
    
    -- Adicionar campo foto_perfil se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'foto_perfil') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN foto_perfil TEXT;
    END IF;
    
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_cidade ON public.profiles (cidade);
CREATE INDEX IF NOT EXISTS idx_profiles_estado ON public.profiles (estado);

-- Comentários nas colunas
COMMENT ON COLUMN public.profiles.cidade IS 'Cidade onde o profissional/salão está localizado';
COMMENT ON COLUMN public.profiles.estado IS 'Estado onde o profissional/salão está localizado';
COMMENT ON COLUMN public.profiles.nome_salao IS 'Nome fantasia do salão';
COMMENT ON COLUMN public.profiles.descricao_salao IS 'Descrição detalhada do salão e seus serviços';
COMMENT ON COLUMN public.profiles.foto_perfil IS 'URL ou base64 da foto de perfil do usuário';
