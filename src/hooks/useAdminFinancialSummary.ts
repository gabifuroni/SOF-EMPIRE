import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminFinancialSummaryData {
  faturamento_bruto: number;
  custos_diretos: number;
  custos_indiretos: number;
  comissoes: number;
  impostos_taxas: number;
  servicos_realizados: number;
  ticket_medio: number;
  resultado_liquido: number;
  margem_lucro: number;
  periodo: {
    mes: number;
    ano: number;
    data_inicio: string;
    data_fim: string;
  };
  percentuais: {
    custos_diretos_pct: number;
    custos_indiretos_pct: number;
    impostos_pct: number;
    comissoes_pct: number;
  };
}

export const useAdminFinancialSummary = (month: number, year: number) => {
  return useQuery({
    queryKey: ['admin-financial-summary', month, year],
    queryFn: async (): Promise<AdminFinancialSummaryData> => {
      // Buscar dados consolidados de todos os usuários manualmente até a função RPC estar disponível
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Buscar todas as transações de entrada do período
      const { data: transactions, error: transError } = await supabase
        .from('transacoes_financeiras')
        .select('valor, commission')
        .eq('tipo_transacao', 'ENTRADA')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (transError) throw transError;

      // Calcular faturamento bruto e comissões
      const faturamento_bruto = transactions?.reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      const comissoes = transactions?.reduce((sum, t) => sum + Number(t.commission || 0), 0) || 0;
      const servicos_realizados = transactions?.length || 0;
      const ticket_medio = servicos_realizados > 0 ? faturamento_bruto / servicos_realizados : 0;

      // Buscar custos diretos
      const { data: custosDiretos, error: custosError } = await supabase
        .from('despesas_diretas_valores')
        .select('valor_mensal')
        .eq('mes_referencia', `${year}-${month.toString().padStart(2, '0')}-01`);

      const custos_diretos = custosDiretos?.reduce((sum, c) => sum + Number(c.valor_mensal), 0) || 0;

      // Buscar custos indiretos
      const { data: custosIndiretos, error: indError } = await supabase
        .from('despesas_indiretas_valores')
        .select('valor_mensal')
        .eq('mes_referencia', `${year}-${month.toString().padStart(2, '0')}-01`);

      const custos_indiretos = custosIndiretos?.reduce((sum, c) => sum + Number(c.valor_mensal), 0) || 0;

      // Impostos (6% padrão)
      const impostos_taxas = faturamento_bruto * 0.06;

      // Cálculos finais
      const resultado_liquido = faturamento_bruto - custos_diretos - custos_indiretos - impostos_taxas;
      const margem_lucro = faturamento_bruto > 0 ? (resultado_liquido / faturamento_bruto) * 100 : 0;

      return {
        faturamento_bruto,
        custos_diretos,
        custos_indiretos,
        comissoes,
        impostos_taxas,
        servicos_realizados,
        ticket_medio,
        resultado_liquido,
        margem_lucro,
        periodo: {
          mes: month,
          ano: year,
          data_inicio: startDate.toISOString().split('T')[0],
          data_fim: endDate.toISOString().split('T')[0]
        },
        percentuais: {
          custos_diretos_pct: faturamento_bruto > 0 ? (custos_diretos / faturamento_bruto) * 100 : 0,
          custos_indiretos_pct: faturamento_bruto > 0 ? (custos_indiretos / faturamento_bruto) * 100 : 0,
          impostos_pct: faturamento_bruto > 0 ? (impostos_taxas / faturamento_bruto) * 100 : 0,
          comissoes_pct: faturamento_bruto > 0 ? (comissoes / faturamento_bruto) * 100 : 0
        }
      };
    },
    enabled: month > 0 && year > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useAdminAnnualSummary = (year: number) => {
  return useQuery({
    queryKey: ['admin-annual-summary', year],
    queryFn: async (): Promise<AdminFinancialSummaryData> => {
      // Buscar dados de todo o ano
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      
      // Buscar todas as transações de entrada do ano
      const { data: transactions, error: transError } = await supabase
        .from('transacoes_financeiras')
        .select('valor, commission')
        .eq('tipo_transacao', 'ENTRADA')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (transError) throw transError;

      // Calcular faturamento bruto e comissões
      const faturamento_bruto = transactions?.reduce((sum, t) => sum + Number(t.valor), 0) || 0;
      const comissoes = transactions?.reduce((sum, t) => sum + Number(t.commission || 0), 0) || 0;
      const servicos_realizados = transactions?.length || 0;
      const ticket_medio = servicos_realizados > 0 ? faturamento_bruto / servicos_realizados : 0;

      // Buscar custos diretos do ano
      const { data: custosDiretos } = await supabase
        .from('despesas_diretas_valores')
        .select('valor_mensal')
        .gte('mes_referencia', `${year}-01-01`)
        .lte('mes_referencia', `${year}-12-31`);

      const custos_diretos = custosDiretos?.reduce((sum, c) => sum + Number(c.valor_mensal), 0) || 0;

      // Buscar custos indiretos do ano
      const { data: custosIndiretos } = await supabase
        .from('despesas_indiretas_valores')
        .select('valor_mensal')
        .gte('mes_referencia', `${year}-01-01`)
        .lte('mes_referencia', `${year}-12-31`);

      const custos_indiretos = custosIndiretos?.reduce((sum, c) => sum + Number(c.valor_mensal), 0) || 0;

      // Impostos (6% padrão)
      const impostos_taxas = faturamento_bruto * 0.06;

      // Cálculos finais
      const resultado_liquido = faturamento_bruto - custos_diretos - custos_indiretos - impostos_taxas;
      const margem_lucro = faturamento_bruto > 0 ? (resultado_liquido / faturamento_bruto) * 100 : 0;

      return {
        faturamento_bruto,
        custos_diretos,
        custos_indiretos,
        comissoes,
        impostos_taxas,
        servicos_realizados,
        ticket_medio,
        resultado_liquido,
        margem_lucro,
        periodo: {
          mes: 0, // Ano todo
          ano: year,
          data_inicio: startDate.toISOString().split('T')[0],
          data_fim: endDate.toISOString().split('T')[0]
        },
        percentuais: {
          custos_diretos_pct: faturamento_bruto > 0 ? (custos_diretos / faturamento_bruto) * 100 : 0,
          custos_indiretos_pct: faturamento_bruto > 0 ? (custos_indiretos / faturamento_bruto) * 100 : 0,
          impostos_pct: faturamento_bruto > 0 ? (impostos_taxas / faturamento_bruto) * 100 : 0,
          comissoes_pct: faturamento_bruto > 0 ? (comissoes / faturamento_bruto) * 100 : 0
        }
      };
    },
    enabled: year > 0,
    staleTime: 10 * 60 * 1000, // 10 minutos para dados anuais
    refetchOnWindowFocus: false,
  });
};
