-- Script para verificar a estrutura da tabela parametros_negocio

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'parametros_negocio'
) as table_exists;

-- 2. Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'parametros_negocio'
ORDER BY ordinal_position;

-- 3. Verificar dados existentes (se houver)
SELECT * FROM public.parametros_negocio LIMIT 5;

-- 4. Criar ou alterar tabela para incluir campos necessários para dias trabalhados e feriados
CREATE TABLE IF NOT EXISTS public.parametros_negocio (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lucro_desejado DECIMAL(5,2) NOT NULL DEFAULT 21.0,
    taxa_impostos DECIMAL(5,2) NOT NULL DEFAULT 8.0,
    taxa_media_ponderada DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    depreciacao_valor_mobilizado DECIMAL(12,2) NOT NULL DEFAULT 160000.0,
    depreciacao_total_mes_depreciado DECIMAL(12,2) NOT NULL DEFAULT 87000.0,
    depreciacao_mensal DECIMAL(10,2) NOT NULL DEFAULT 1450.0,
    dias_trabalhados_ano INTEGER NOT NULL DEFAULT 240,
    equipe_numero_profissionais INTEGER NOT NULL DEFAULT 2,
    -- Novos campos para dias da semana trabalhados
    trabalha_segunda BOOLEAN NOT NULL DEFAULT true,
    trabalha_terca BOOLEAN NOT NULL DEFAULT true,
    trabalha_quarta BOOLEAN NOT NULL DEFAULT true,
    trabalha_quinta BOOLEAN NOT NULL DEFAULT true,
    trabalha_sexta BOOLEAN NOT NULL DEFAULT true,
    trabalha_sabado BOOLEAN NOT NULL DEFAULT false,
    trabalha_domingo BOOLEAN NOT NULL DEFAULT false,
    -- Campo para armazenar feriados (JSON)
    feriados JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 5. Adicionar colunas se não existirem
DO $$ 
BEGIN
    -- Adicionar campos de dias da semana se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parametros_negocio' 
                   AND column_name = 'trabalha_segunda') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN trabalha_segunda BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parametros_negocio' 
                   AND column_name = 'trabalha_terca') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN trabalha_terca BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parametros_negocio' 
                   AND column_name = 'trabalha_quarta') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN trabalha_quarta BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parametros_negocio' 
                   AND column_name = 'trabalha_quinta') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN trabalha_quinta BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parametros_negocio' 
                   AND column_name = 'trabalha_sexta') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN trabalha_sexta BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parametros_negocio' 
                   AND column_name = 'trabalha_sabado') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN trabalha_sabado BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parametros_negocio' 
                   AND column_name = 'trabalha_domingo') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN trabalha_domingo BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    -- Adicionar campo de feriados se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parametros_negocio' 
                   AND column_name = 'feriados') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN feriados JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 6. Enable RLS
ALTER TABLE public.parametros_negocio ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policy
DROP POLICY IF EXISTS "Users can manage own business parameters" ON public.parametros_negocio;
CREATE POLICY "Users can manage own business parameters" ON public.parametros_negocio
    FOR ALL USING (auth.uid() = user_id);

-- 8. Inserir dados padrão para usuários existentes
INSERT INTO public.parametros_negocio (
    user_id, lucro_desejado, taxa_impostos, taxa_media_ponderada,
    depreciacao_valor_mobilizado, depreciacao_total_mes_depreciado, depreciacao_mensal,
    dias_trabalhados_ano, equipe_numero_profissionais,
    trabalha_segunda, trabalha_terca, trabalha_quarta, trabalha_quinta, trabalha_sexta,
    trabalha_sabado, trabalha_domingo,
    feriados
)
SELECT 
    id as user_id,
    21.0 as lucro_desejado,
    8.0 as taxa_impostos,
    0.0 as taxa_media_ponderada,
    160000.0 as depreciacao_valor_mobilizado,
    87000.0 as depreciacao_total_mes_depreciado,
    1450.0 as depreciacao_mensal,
    240 as dias_trabalhados_ano,
    2 as equipe_numero_profissionais,
    true as trabalha_segunda,
    true as trabalha_terca,
    true as trabalha_quarta,
    true as trabalha_quinta,
    true as trabalha_sexta,
    false as trabalha_sabado,
    false as trabalha_domingo,
    '[
        {"id": "1", "date": "2024-01-01", "name": "Confraternização Universal"},
        {"id": "2", "date": "2024-04-21", "name": "Tiradentes"},
        {"id": "3", "date": "2024-09-07", "name": "Independência do Brasil"}
    ]'::jsonb as feriados
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.parametros_negocio pn WHERE pn.user_id = auth.users.id
);
