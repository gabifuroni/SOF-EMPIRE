-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categorias_despesas (
  user_id uuid NOT NULL,
  nome_categoria text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_predefinida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categorias_despesas_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_despesas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.config_formas_pagamento (
  percentual_distribuicao numeric NOT NULL DEFAULT 0,
  user_id uuid NOT NULL,
  nome_metodo text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  taxa_percentual numeric NOT NULL DEFAULT 0,
  is_ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  prazo_recebimento_dias numeric NOT NULL DEFAULT 0,
  CONSTRAINT config_formas_pagamento_pkey PRIMARY KEY (id),
  CONSTRAINT config_formas_pagamento_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.despesas_diretas_valores (
  user_id uuid NOT NULL,
  categoria_id uuid NOT NULL,
  mes_referencia date NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  valor_mensal numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT despesas_diretas_valores_pkey PRIMARY KEY (id),
  CONSTRAINT despesas_diretas_valores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT despesas_diretas_valores_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_despesas(id)
);
CREATE TABLE public.despesas_indiretas_categorias (
  is_fixed boolean DEFAULT false,
  user_id uuid NOT NULL,
  nome_categoria_despesa text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_predefinida boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT despesas_indiretas_categorias_pkey PRIMARY KEY (id),
  CONSTRAINT despesas_indiretas_categorias_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.despesas_indiretas_valores (
  user_id uuid NOT NULL,
  categoria_id uuid NOT NULL,
  valor_mensal numeric NOT NULL,
  mes_referencia date NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT despesas_indiretas_valores_pkey PRIMARY KEY (id),
  CONSTRAINT despesas_indiretas_valores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT despesas_indiretas_valores_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.despesas_indiretas_categorias(id)
);
CREATE TABLE public.materias_primas (
  user_id uuid NOT NULL,
  name text NOT NULL,
  batch_quantity numeric NOT NULL,
  batch_price numeric NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  unit text NOT NULL DEFAULT 'ml'::text,
  unit_cost numeric DEFAULT (batch_price / batch_quantity),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT materias_primas_pkey PRIMARY KEY (id),
  CONSTRAINT materias_primas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.metas_usuario (
  user_id uuid NOT NULL UNIQUE,
  tipo_meta text NOT NULL CHECK (tipo_meta = ANY (ARRAY['financeira'::text, 'atendimentos'::text])),
  meta_atendimentos_mensal integer,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  valor_meta_mensal numeric NOT NULL DEFAULT 10000,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT metas_usuario_pkey PRIMARY KEY (id),
  CONSTRAINT metas_usuario_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.parametros_negocio (
  trabalha_segunda boolean NOT NULL DEFAULT true,
  trabalha_terca boolean NOT NULL DEFAULT true,
  trabalha_quarta boolean NOT NULL DEFAULT true,
  trabalha_quinta boolean NOT NULL DEFAULT true,
  trabalha_sexta boolean NOT NULL DEFAULT true,
  trabalha_sabado boolean NOT NULL DEFAULT false,
  trabalha_domingo boolean NOT NULL DEFAULT false,
  feriados jsonb DEFAULT '[]'::jsonb,
  despesas_indiretas_depreciacao numeric NOT NULL DEFAULT 35.0,
  taxa_media_ponderada real NOT NULL,
  user_id uuid NOT NULL UNIQUE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lucro_desejado numeric NOT NULL DEFAULT 15.0,
  taxa_impostos numeric NOT NULL DEFAULT 5.0,
  depreciacao_valor_mobilizado numeric NOT NULL DEFAULT 100000,
  depreciacao_total_mes_depreciado numeric NOT NULL DEFAULT 8700,
  depreciacao_mensal numeric NOT NULL DEFAULT 1450,
  dias_trabalhados_ano integer NOT NULL DEFAULT 257,
  equipe_numero_profissionais integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT parametros_negocio_pkey PRIMARY KEY (id),
  CONSTRAINT parametros_negocio_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.patentes (
  nome_patente text NOT NULL UNIQUE,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faturamento_minimo_necessario numeric NOT NULL DEFAULT 0,
  icon text DEFAULT '🌟'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT patentes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  id uuid NOT NULL,
  email text,
  telefone text,
  endereco text,
  current_patente_id uuid,
  nome_profissional_ou_salao text NOT NULL DEFAULT 'Novo Profissional'::text,
  role USER-DEFINED NOT NULL DEFAULT 'user'::user_role,
  faturamento_total_acumulado numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  cidade text,
  estado text,
  descricao_salao text,
  foto_perfil text,
  nome_salao text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_current_patente_id_fkey FOREIGN KEY (current_patente_id) REFERENCES public.patentes(id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.servicos (
  user_id uuid NOT NULL,
  name text NOT NULL,
  sale_price numeric NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
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
  user_id uuid NOT NULL,
  tipo_transacao USER-DEFINED NOT NULL,
  valor numeric NOT NULL,
  description text NOT NULL,
  payment_method text,
  category text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  commission numeric DEFAULT NULL::numeric,
  servico_id uuid,
  is_recurring boolean DEFAULT false,
  recurring_frequency text,
  CONSTRAINT transacoes_financeiras_pkey PRIMARY KEY (id),
  CONSTRAINT transacoes_financeiras_servico_id_fkey FOREIGN KEY (servico_id) REFERENCES public.servicos(id),
  CONSTRAINT transacoes_financeiras_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);