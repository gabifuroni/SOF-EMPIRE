-- Criar tabela parametros_negocio se não existir
CREATE TABLE IF NOT EXISTS public.parametros_negocio (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lucro_desejado numeric DEFAULT 21.0,
  despesas_indiretas_depreciacao numeric DEFAULT 35.0,
  taxa_impostos numeric DEFAULT 8.0,
  taxa_media_ponderada numeric DEFAULT 2.13,
  depreciacao_valor_mobilizado numeric DEFAULT 160000,
  depreciacao_total_mes_depreciado numeric DEFAULT 87000,
  depreciacao_mensal numeric DEFAULT 1450,
  dias_trabalhados_ano integer DEFAULT 240,
  equipe_numero_profissionais integer DEFAULT 2,
  trabalha_segunda boolean DEFAULT true,
  trabalha_terca boolean DEFAULT true,
  trabalha_quarta boolean DEFAULT true,
  trabalha_quinta boolean DEFAULT true,
  trabalha_sexta boolean DEFAULT true,
  trabalha_sabado boolean DEFAULT false,
  trabalha_domingo boolean DEFAULT false,
  feriados jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_parametros_negocio_user_id ON public.parametros_negocio(user_id);

-- Habilitar RLS
ALTER TABLE public.parametros_negocio ENABLE ROW LEVEL SECURITY;

-- Política de segurança: usuários só podem ver/editar seus próprios parâmetros
CREATE POLICY "Users can only see their own business parameters" ON public.parametros_negocio
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own business parameters" ON public.parametros_negocio
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own business parameters" ON public.parametros_negocio
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own business parameters" ON public.parametros_negocio
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_parametros_negocio_updated_at
    BEFORE UPDATE ON public.parametros_negocio
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se a coluna despesas_indiretas_depreciacao existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'parametros_negocio' 
                   AND column_name = 'despesas_indiretas_depreciacao') THEN
        ALTER TABLE public.parametros_negocio 
        ADD COLUMN despesas_indiretas_depreciacao numeric DEFAULT 35.0;
    END IF;
END $$;
