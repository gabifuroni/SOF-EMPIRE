-- Add is_fixed column to despesas_indiretas_categorias table
ALTER TABLE public.despesas_indiretas_categorias 
ADD COLUMN IF NOT EXISTS is_fixed BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN public.despesas_indiretas_categorias.is_fixed IS 'Indicates if this expense category should be treated as a fixed expense that applies to all months when set for January';
