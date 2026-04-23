-- Add column to store collaborator names as JSON array
ALTER TABLE public.parametros_negocio
  ADD COLUMN IF NOT EXISTS equipe_nomes_profissionais jsonb DEFAULT '[]'::jsonb;
