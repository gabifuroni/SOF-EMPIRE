-- Verificar e corrigir problemas nas tabelas

-- 1. Verificar se a tabela metas_usuario existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'metas_usuario'
);

-- 2. Verificar a estrutura da tabela parametros_negocio
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'parametros_negocio'
ORDER BY ordinal_position;

-- 3. Verificar a estrutura da tabela config_formas_pagamento
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'config_formas_pagamento'
ORDER BY ordinal_position;

-- 4. Se a tabela metas_usuario não existir, criar
CREATE TABLE IF NOT EXISTS public.metas_usuario (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_meta TEXT NOT NULL DEFAULT 'financeira',
    valor_meta_mensal DECIMAL(10,2) NOT NULL DEFAULT 10000.00,
    meta_atendimentos_mensal INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS para metas_usuario
ALTER TABLE public.metas_usuario ENABLE ROW LEVEL SECURITY;

-- Create RLS policy para metas_usuario
CREATE POLICY "Users can manage own goals" ON public.metas_usuario
    FOR ALL USING (auth.uid() = user_id);

-- 5. Inserir metas padrão para usuários existentes
INSERT INTO public.metas_usuario (user_id, tipo_meta, valor_meta_mensal, meta_atendimentos_mensal)
SELECT 
    id as user_id,
    'financeira' as tipo_meta,
    10000.00 as valor_meta_mensal,
    50 as meta_atendimentos_mensal
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.metas_usuario mu WHERE mu.user_id = auth.users.id
);

-- 6. Verificar se o campo prazo_recebimento_dias é integer, se for, alterar para DECIMAL
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'config_formas_pagamento' 
        AND column_name = 'prazo_recebimento_dias' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE public.config_formas_pagamento 
        ALTER COLUMN prazo_recebimento_dias TYPE DECIMAL(5,2);
    END IF;
END $$;
