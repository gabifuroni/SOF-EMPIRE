
-- Verificar e criar apenas o que não existe

-- Criar enum para tipos de usuário (se não existir)
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de patentes (se não existir)
CREATE TABLE IF NOT EXISTS public.patentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_patente TEXT NOT NULL UNIQUE,
  faturamento_minimo_necessario DECIMAL(10,2) NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '🌟',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfis (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_profissional_ou_salao TEXT NOT NULL DEFAULT 'Novo Profissional',
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  role user_role NOT NULL DEFAULT 'user',
  faturamento_total_acumulado DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_patente_id UUID REFERENCES public.patentes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir patentes padrão (se não existirem)
INSERT INTO public.patentes (nome_patente, faturamento_minimo_necessario, icon) VALUES
('Beauty Starters', 0, '🌟'),
('Glow Achievers', 3000, '✨'),
('Elegance Experts', 6000, '💎'),
('Luxury Creators', 9000, '👑'),
('Empire Queens', 12000, '🏆'),
('Imperatrizes Elite', 15000, '💫')
ON CONFLICT (nome_patente) DO NOTHING;

-- Função para atualizar patente do usuário
CREATE OR REPLACE FUNCTION public.update_user_patente(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_revenue DECIMAL(10,2);
  new_patente_id UUID;
BEGIN
  -- Get current accumulated revenue
  SELECT faturamento_total_acumulado INTO current_revenue
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Find appropriate patente based on revenue
  SELECT id INTO new_patente_id
  FROM public.patentes 
  WHERE faturamento_minimo_necessario <= COALESCE(current_revenue, 0)
  ORDER BY faturamento_minimo_necessario DESC
  LIMIT 1;
  
  -- Update user's patente
  UPDATE public.profiles 
  SET current_patente_id = new_patente_id,
      updated_at = now()
  WHERE id = user_uuid;
END;
$$;

-- Função para lidar com novos usuários
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
  
  -- Insert default expense categories
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

  -- Insert default indirect expense categories
  INSERT INTO public.despesas_indiretas_categorias (user_id, nome_categoria_despesa, is_predefinida)
  VALUES 
    (new.id, 'Aluguel', true),
    (new.id, 'Contabilidade', true),
    (new.id, 'Energia Elétrica', true),
    (new.id, 'Água', true),
    (new.id, 'Internet/Telefone', true),
    (new.id, 'Software/Assinaturas', true),
    (new.id, 'Marketing e Publicidade', true),
    (new.id, 'Material de Escritório', true),
    (new.id, 'Salários e Encargos', true),
    (new.id, 'Pró-labore', true),
    (new.id, 'Impostos Fixos', true),
    (new.id, 'Limpeza e Higiene', true),
    (new.id, 'Outras Despesas', true);

  RETURN new;
END;
$$;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar faturamento e patente
CREATE OR REPLACE FUNCTION update_revenue_and_patente()
RETURNS TRIGGER AS $$
DECLARE
  old_revenue_impact DECIMAL(10,2) DEFAULT 0;
  new_revenue_impact DECIMAL(10,2) DEFAULT 0;
  user_uuid UUID;
BEGIN
  -- Handle INSERT and UPDATE operations
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    user_uuid := NEW.user_id;
    
    -- Calculate new revenue impact (only for ENTRADA transactions)
    IF NEW.tipo_transacao = 'ENTRADA' THEN
      new_revenue_impact := NEW.valor;
    END IF;
  END IF;
  
  -- Handle UPDATE and DELETE operations (subtract old values)
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    user_uuid := OLD.user_id;
    
    -- Calculate old revenue impact (only for ENTRADA transactions)
    IF OLD.tipo_transacao = 'ENTRADA' THEN
      old_revenue_impact := OLD.valor;
    END IF;
  END IF;
  
  -- Update accumulated revenue
  UPDATE public.profiles 
  SET faturamento_total_acumulado = faturamento_total_acumulado + new_revenue_impact - old_revenue_impact,
      updated_at = now()
  WHERE id = user_uuid;
  
  -- Update patente
  PERFORM public.update_user_patente(user_uuid);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_update_revenue ON public.transacoes_financeiras;

-- Criar trigger para transações financeiras
CREATE TRIGGER trigger_update_revenue
  AFTER INSERT OR UPDATE OR DELETE ON public.transacoes_financeiras
  FOR EACH ROW EXECUTE FUNCTION update_revenue_and_patente();

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias_primas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_indiretas_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_indiretas_valores ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own materials" ON public.materias_primas;
DROP POLICY IF EXISTS "Users can manage own services" ON public.servicos;
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "Users can manage own expense categories" ON public.categorias_despesas;
DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.config_formas_pagamento;
DROP POLICY IF EXISTS "Users can manage own indirect expense categories" ON public.despesas_indiretas_categorias;
DROP POLICY IF EXISTS "Users can manage own indirect expense values" ON public.despesas_indiretas_valores;
DROP POLICY IF EXISTS "Patentes are publicly readable" ON public.patentes;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para materias_primas
CREATE POLICY "Users can manage own materials" ON public.materias_primas
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para servicos
CREATE POLICY "Users can manage own services" ON public.servicos
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para transacoes_financeiras
CREATE POLICY "Users can manage own transactions" ON public.transacoes_financeiras
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para categorias_despesas
CREATE POLICY "Users can manage own expense categories" ON public.categorias_despesas
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para config_formas_pagamento
CREATE POLICY "Users can manage own payment methods" ON public.config_formas_pagamento
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para despesas_indiretas_categorias
CREATE POLICY "Users can manage own indirect expense categories" ON public.despesas_indiretas_categorias
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para despesas_indiretas_valores
CREATE POLICY "Users can manage own indirect expense values" ON public.despesas_indiretas_valores
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para patentes (leitura pública)
ALTER TABLE public.patentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patentes are publicly readable" ON public.patentes
  FOR SELECT TO public USING (true);
