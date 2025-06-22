-- Adicionar coluna percentual_distribuicao à tabela config_formas_pagamento
ALTER TABLE public.config_formas_pagamento 
ADD COLUMN percentual_distribuicao numeric(5, 2) NOT NULL DEFAULT 0;

-- Migrar os dados existentes do campo prazo_recebimento_dias para percentual_distribuicao
UPDATE public.config_formas_pagamento 
SET percentual_distribuicao = prazo_recebimento_dias;

-- Resetar o campo prazo_recebimento_dias para seus valores corretos (em dias)
UPDATE public.config_formas_pagamento 
SET prazo_recebimento_dias = CASE 
    WHEN nome_metodo = 'Crédito' THEN 30
    WHEN nome_metodo = 'Crédito Parcelado' THEN 30
    WHEN nome_metodo = 'Débito' THEN 1
    WHEN nome_metodo = 'Dinheiro/Cheque' THEN 0
    WHEN nome_metodo = 'PIX' THEN 0
    WHEN nome_metodo = 'Transferência Bancária' THEN 1
    ELSE 1
END;

-- Comentário para documentar o uso correto dos campos
COMMENT ON COLUMN public.config_formas_pagamento.percentual_distribuicao IS 'Percentual de distribuição desta forma de pagamento (ex: 50% para crédito)';
COMMENT ON COLUMN public.config_formas_pagamento.prazo_recebimento_dias IS 'Prazo em dias para recebimento desta forma de pagamento';
