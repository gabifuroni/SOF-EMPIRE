
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "Admins can view all services" ON public.servicos;
DROP POLICY IF EXISTS "Admins can view all materials" ON public.materias_primas;

-- Criar função para verificar se um usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = user_id;
$$;

-- Criar novas políticas para profiles
CREATE POLICY "Users can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

-- Criar políticas para admins poderem ver todos os dados
CREATE POLICY "Admins can view all transactions" 
  ON public.transacoes_financeiras 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all services" 
  ON public.servicos 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all materials" 
  ON public.materias_primas 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));
