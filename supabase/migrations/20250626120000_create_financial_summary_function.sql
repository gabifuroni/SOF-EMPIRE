-- Criação da função RPC get_financial_summary para centralizar cálculos financeiros
-- Esta função consolida todos os cálculos que atualmente são feitos no frontend

CREATE OR REPLACE FUNCTION get_financial_summary(
  p_month integer,
  p_year integer,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_faturamento_bruto numeric := 0;
  v_custos_diretos numeric := 0;
  v_custos_indiretos numeric := 0;
  v_comissoes numeric := 0;
  v_impostos_taxas numeric := 0;
  v_servicos_realizados integer := 0;
  v_ticket_medio numeric := 0;
  v_resultado_liquido numeric := 0;
  v_margem_lucro numeric := 0;
  v_start_date date;
  v_end_date date;
  v_percentual_impostos numeric := 6.0; -- Percentual padrão de impostos
BEGIN
  -- Validar parâmetros de entrada
  IF p_month < 1 OR p_month > 12 THEN
    RAISE EXCEPTION 'Mês deve estar entre 1 e 12';
  END IF;
  
  IF p_year < 2020 OR p_year > 2030 THEN
    RAISE EXCEPTION 'Ano deve estar entre 2020 e 2030';
  END IF;

  -- Calcular datas de início e fim do mês
  v_start_date := make_date(p_year, p_month, 1);
  v_end_date := (v_start_date + interval '1 month' - interval '1 day')::date;

  -- 1. FATURAMENTO BRUTO (soma de todas as entradas do mês)
  SELECT COALESCE(SUM(valor), 0)
  INTO v_faturamento_bruto
  FROM transacoes_financeiras
  WHERE user_id = p_user_id
    AND tipo_transacao = 'ENTRADA'
    AND date >= v_start_date
    AND date <= v_end_date;

  -- 2. COMISSÕES (soma das comissões das transações de entrada)
  SELECT COALESCE(SUM(commission), 0)
  INTO v_comissoes
  FROM transacoes_financeiras
  WHERE user_id = p_user_id
    AND tipo_transacao = 'ENTRADA'
    AND date >= v_start_date
    AND date <= v_end_date
    AND commission IS NOT NULL;

  -- 3. CUSTOS DIRETOS (despesas diretas + comissões)
  -- Primeiro, obter as despesas diretas do mês
  SELECT COALESCE(SUM(ddv.valor_mensal), 0)
  INTO v_custos_diretos
  FROM despesas_diretas_valores ddv
  WHERE ddv.user_id = p_user_id
    AND EXTRACT(MONTH FROM ddv.mes_referencia) = p_month
    AND EXTRACT(YEAR FROM ddv.mes_referencia) = p_year;
  
  -- Adicionar as comissões aos custos diretos
  v_custos_diretos := v_custos_diretos + v_comissoes;

  -- 4. CUSTOS INDIRETOS (despesas indiretas do mês)
  SELECT COALESCE(SUM(div.valor_mensal), 0)
  INTO v_custos_indiretos
  FROM despesas_indiretas_valores div
  WHERE div.user_id = p_user_id
    AND EXTRACT(MONTH FROM div.mes_referencia) = p_month
    AND EXTRACT(YEAR FROM div.mes_referencia) = p_year;

  -- 5. IMPOSTOS E TAXAS (percentual sobre o faturamento bruto)
  -- Buscar o percentual dos parâmetros do negócio, se disponível
  SELECT COALESCE(pb.taxa_impostos, v_percentual_impostos)
  INTO v_percentual_impostos
  FROM parametros_negocio pb
  WHERE pb.user_id = p_user_id
  LIMIT 1;

  v_impostos_taxas := (v_faturamento_bruto * v_percentual_impostos) / 100;

  -- 6. SERVIÇOS REALIZADOS (número de transações de entrada)
  SELECT COUNT(*)
  INTO v_servicos_realizados
  FROM transacoes_financeiras
  WHERE user_id = p_user_id
    AND tipo_transacao = 'ENTRADA'
    AND date >= v_start_date
    AND date <= v_end_date;

  -- 7. TICKET MÉDIO (faturamento bruto / serviços realizados)
  IF v_servicos_realizados > 0 THEN
    v_ticket_medio := v_faturamento_bruto / v_servicos_realizados;
  ELSE
    v_ticket_medio := 0;
  END IF;

  -- 8. RESULTADO LÍQUIDO (faturamento bruto - custos diretos - custos indiretos - impostos)
  v_resultado_liquido := v_faturamento_bruto - v_custos_diretos - v_custos_indiretos - v_impostos_taxas;

  -- 9. MARGEM DE LUCRO (resultado líquido / faturamento bruto * 100)
  IF v_faturamento_bruto > 0 THEN
    v_margem_lucro := (v_resultado_liquido / v_faturamento_bruto) * 100;
  ELSE
    v_margem_lucro := 0;
  END IF;

  -- Retornar JSON com todos os dados consolidados
  RETURN json_build_object(
    'faturamento_bruto', v_faturamento_bruto,
    'custos_diretos', v_custos_diretos,
    'custos_indiretos', v_custos_indiretos,
    'comissoes', v_comissoes,
    'impostos_taxas', v_impostos_taxas,
    'servicos_realizados', v_servicos_realizados,
    'ticket_medio', v_ticket_medio,
    'resultado_liquido', v_resultado_liquido,
    'margem_lucro', v_margem_lucro,
    'periodo', json_build_object(
      'mes', p_month,
      'ano', p_year,
      'data_inicio', v_start_date,
      'data_fim', v_end_date
    ),
    'percentuais', json_build_object(
      'custos_diretos_pct', CASE WHEN v_faturamento_bruto > 0 THEN (v_custos_diretos / v_faturamento_bruto) * 100 ELSE 0 END,
      'custos_indiretos_pct', CASE WHEN v_faturamento_bruto > 0 THEN (v_custos_indiretos / v_faturamento_bruto) * 100 ELSE 0 END,
      'impostos_pct', CASE WHEN v_faturamento_bruto > 0 THEN (v_impostos_taxas / v_faturamento_bruto) * 100 ELSE 0 END,
      'comissoes_pct', CASE WHEN v_faturamento_bruto > 0 THEN (v_comissoes / v_faturamento_bruto) * 100 ELSE 0 END
    )
  );
END;
$$;

-- Garantir que a função seja acessível via RPC
GRANT EXECUTE ON FUNCTION get_financial_summary TO authenticated;

-- Comentário explicativo
COMMENT ON FUNCTION get_financial_summary IS 'Função RPC que centraliza todos os cálculos financeiros mensais, retornando um resumo completo dos indicadores de performance financeira para o mês/ano especificado.';
