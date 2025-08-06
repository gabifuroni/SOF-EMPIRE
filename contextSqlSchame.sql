-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categorias_despesas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome_categoria text NOT NULL,
  is_predefinida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categorias_despesas_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_despesas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.config_formas_pagamento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome_metodo text NOT NULL,
  taxa_percentual numeric NOT NULL DEFAULT 0,
  prazo_recebimento_dias numeric NOT NULL DEFAULT 0,
  is_ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  percentual_distribuicao numeric NOT NULL DEFAULT 0,
  CONSTRAINT config_formas_pagamento_pkey PRIMARY KEY (id),
  CONSTRAINT config_formas_pagamento_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.despesas_diretas_categorias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome_categoria text NOT NULL,
  is_predefinida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT despesas_diretas_categorias_pkey PRIMARY KEY (id),
  CONSTRAINT despesas_diretas_categorias_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.despesas_diretas_valores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  categoria_id uuid NOT NULL,
  mes_referencia date NOT NULL,
  valor_mensal numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT despesas_diretas_valores_pkey PRIMARY KEY (id),
  CONSTRAINT despesas_diretas_valores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT despesas_diretas_valores_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.despesas_diretas_categorias(id)
);
CREATE TABLE public.despesas_indiretas_categorias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome_categoria_despesa text NOT NULL,
  is_predefinida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_fixed boolean DEFAULT false,
  CONSTRAINT despesas_indiretas_categorias_pkey PRIMARY KEY (id),
  CONSTRAINT despesas_indiretas_categorias_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.despesas_indiretas_valores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  categoria_id uuid NOT NULL,
  valor_mensal numeric NOT NULL,
  mes_referencia date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT despesas_indiretas_valores_pkey PRIMARY KEY (id),
  CONSTRAINT despesas_indiretas_valores_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.despesas_indiretas_categorias(id),
  CONSTRAINT despesas_indiretas_valores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.materias_primas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  batch_quantity numeric NOT NULL,
  unit text NOT NULL DEFAULT 'ml'::text,
  batch_price numeric NOT NULL,
  unit_cost numeric DEFAULT (batch_price / batch_quantity),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT materias_primas_pkey PRIMARY KEY (id),
  CONSTRAINT materias_primas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.metas_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tipo_meta text NOT NULL CHECK (tipo_meta = ANY (ARRAY['financeira'::text, 'atendimentos'::text])),
  valor_meta_mensal numeric NOT NULL DEFAULT 10000,
  meta_atendimentos_mensal integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT metas_usuario_pkey PRIMARY KEY (id),
  CONSTRAINT metas_usuario_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.parametros_negocio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  lucro_desejado numeric NOT NULL DEFAULT 15.0,
  taxa_impostos numeric NOT NULL DEFAULT 5.0,
  taxa_media_ponderada real NOT NULL,
  depreciacao_valor_mobilizado numeric NOT NULL DEFAULT 100000,
  depreciacao_total_mes_depreciado numeric NOT NULL DEFAULT 8700,
  depreciacao_mensal numeric NOT NULL DEFAULT 1450,
  dias_trabalhados_ano integer NOT NULL DEFAULT 257,
  equipe_numero_profissionais integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  trabalha_segunda boolean NOT NULL DEFAULT true,
  trabalha_terca boolean NOT NULL DEFAULT true,
  trabalha_quarta boolean NOT NULL DEFAULT true,
  trabalha_quinta boolean NOT NULL DEFAULT true,
  trabalha_sexta boolean NOT NULL DEFAULT true,
  trabalha_sabado boolean NOT NULL DEFAULT false,
  trabalha_domingo boolean NOT NULL DEFAULT false,
  feriados jsonb DEFAULT '[]'::jsonb,
  despesas_indiretas_depreciacao numeric NOT NULL DEFAULT 35.0,
  CONSTRAINT parametros_negocio_pkey PRIMARY KEY (id),
  CONSTRAINT parametros_negocio_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.patentes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome_patente text NOT NULL UNIQUE,
  faturamento_minimo_necessario numeric NOT NULL DEFAULT 0,
  icon text DEFAULT '🌟'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT patentes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  nome_profissional_ou_salao text NOT NULL DEFAULT 'Novo Profissional'::text,
  email text,
  telefone text,
  endereco text,
  role USER-DEFINED NOT NULL DEFAULT 'user'::user_role,
  faturamento_total_acumulado numeric NOT NULL DEFAULT 0,
  current_patente_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  cidade text,
  estado text,
  descricao_salao text,
  foto_perfil text,
  nome_salao text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_current_patente_id_fkey FOREIGN KEY (current_patente_id) REFERENCES public.patentes(id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.servicos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  sale_price numeric NOT NULL,
  card_tax_rate numeric NOT NULL DEFAULT 3.5,
  service_tax_rate numeric NOT NULL DEFAULT 5.0,
  commission_rate numeric NOT NULL DEFAULT 25.0,
  material_costs jsonb DEFAULT '[]'::jsonb,
  total_cost numeric NOT NULL DEFAULT 0,
  gross_profit numeric NOT NULL DEFAULT 0,
  profit_margin numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT servicos_pkey PRIMARY KEY (id),
  CONSTRAINT servicos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.transacoes_financeiras (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo_transacao USER-DEFINED NOT NULL,
  valor numeric NOT NULL,
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  servico_id uuid,
  is_recurring boolean DEFAULT false,
  recurring_frequency text,
  commission numeric DEFAULT NULL::numeric,
  CONSTRAINT transacoes_financeiras_pkey PRIMARY KEY (id),
  CONSTRAINT transacoes_financeiras_servico_id_fkey FOREIGN KEY (servico_id) REFERENCES public.servicos(id),
  CONSTRAINT transacoes_financeiras_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);