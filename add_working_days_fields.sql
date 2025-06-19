-- Script para adicionar campos necessários na tabela parametros_negocio

-- Adicionar colunas se não existirem
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

-- Atualizar registros existentes com feriados padrão (se não tiverem)
UPDATE public.parametros_negocio 
SET feriados = '[
    {"id": "1", "date": "2024-01-01", "name": "Confraternização Universal"},
    {"id": "2", "date": "2024-04-21", "name": "Tiradentes"},
    {"id": "3", "date": "2024-09-07", "name": "Independência do Brasil"}
]'::jsonb
WHERE feriados IS NULL OR feriados = '[]'::jsonb;
