CREATE TABLE IF NOT EXISTS public.metas_colaboradoras (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  colaboradora_id text NOT NULL,
  colaboradora_nome text NOT NULL,
  mes_referencia text NOT NULL,
  meta_faturamento numeric(10,2) DEFAULT 0,
  meta_atendimentos integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, colaboradora_id, mes_referencia)
);

ALTER TABLE public.metas_colaboradoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own metas_colaboradoras"
  ON public.metas_colaboradoras
  FOR ALL USING (auth.uid() = user_id);
