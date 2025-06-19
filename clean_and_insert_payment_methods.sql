-- Inserir métodos de pagamento padrão para todos os usuários
-- Description: Adiciona os 4 métodos de pagamento principais com os valores corretos

-- Primeiro, deletar todos os métodos existentes para garantir limpeza
DELETE FROM public.config_formas_pagamento;

-- Inserir os métodos de pagamento para todos os usuários existentes
INSERT INTO public.config_formas_pagamento (user_id, nome_metodo, taxa_percentual, prazo_recebimento_dias, is_ativo)
SELECT 
    u.id as user_id,
    metodo.nome_metodo,
    metodo.taxa_percentual,
    metodo.prazo_recebimento_dias,
    metodo.is_ativo
FROM auth.users u
CROSS JOIN (
    VALUES 
        ('Crédito', 3.20, 50.0, true),
        ('Crédito Parcelado', 6.34, 5.0, true),
        ('Débito', 1.39, 15.0, true),
        ('Dinheiro/Pix', 0.00, 30.0, true)
) AS metodo(nome_metodo, taxa_percentual, prazo_recebimento_dias, is_ativo);

-- Verificar se os métodos foram inseridos corretamente
SELECT 
    u.email,
    cfp.nome_metodo,
    cfp.taxa_percentual,
    cfp.prazo_recebimento_dias,
    cfp.is_ativo
FROM auth.users u
JOIN public.config_formas_pagamento cfp ON u.id = cfp.user_id
ORDER BY u.email, cfp.nome_metodo;
