-- Create table for direct expenses values
CREATE TABLE IF NOT EXISTS public.despesas_diretas_valores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias_despesas(id) ON DELETE CASCADE,
  valor_mensal NUMERIC NOT NULL DEFAULT 0,
  mes_referencia DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, categoria_id, mes_referencia)
);

-- Enable RLS
ALTER TABLE public.despesas_diretas_valores ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own direct expense values" ON public.despesas_diretas_valores
  FOR ALL USING (auth.uid() = user_id);
