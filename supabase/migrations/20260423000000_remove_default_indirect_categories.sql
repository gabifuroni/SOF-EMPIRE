-- Remove all predefined indirect expense categories (existing users)
DELETE FROM public.despesas_indiretas_categorias WHERE is_predefinida = true;

-- Update handle_new_user() to not insert default indirect expense categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, nome_profissional_ou_salao, email, current_patente_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome_profissional_ou_salao', 'Novo Profissional'),
    new.email,
    (SELECT id FROM public.patentes WHERE nome_patente = 'Beauty Starters' LIMIT 1)
  );

  -- Insert default expense categories (direct expenses)
  INSERT INTO public.categorias_despesas (user_id, nome_categoria, is_predefinida)
  VALUES
    (new.id, 'Aluguel', true),
    (new.id, 'Fornecedores', true),
    (new.id, 'Marketing', true),
    (new.id, 'Impostos', true),
    (new.id, 'Salários', true),
    (new.id, 'Equipamentos', true),
    (new.id, 'Materiais de Limpeza', true),
    (new.id, 'Energia Elétrica', true),
    (new.id, 'Telefone/Internet', true),
    (new.id, 'Outras Despesas', true);

  -- Insert default payment methods
  INSERT INTO public.config_formas_pagamento (user_id, nome_metodo, taxa_percentual, prazo_recebimento_dias)
  VALUES
    (new.id, 'Crédito', 3.20, 50.0),
    (new.id, 'Crédito Parcelado', 6.34, 5.0),
    (new.id, 'Débito', 1.39, 15.0),
    (new.id, 'Dinheiro/Cheque', 0.00, 30.0);

  -- NOTE: No default indirect expense categories are inserted.
  -- Users start with an empty list and add their own categories.

  RETURN new;
END;
$$;
