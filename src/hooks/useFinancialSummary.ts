import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessSettings } from './useBusinessSettings';

interface FinancialSummaryData {
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
  depreciacao_mensal?: number; // Adicionado para facilitar downstream
}

export const useFinancialSummary = (month: number, year: number) => {
  // Busca os parâmetros do negócio para pegar a depreciação mensal
  const { settings: businessSettings } = useBusinessSettings();

  return useQuery({
    queryKey: ['financial-summary', month, year, businessSettings?.depreciacaoTotalMesDepreciado],
    queryFn: async (): Promise<FinancialSummaryData & { depreciacao_mensal: number }> => {
      const { data, error } = await supabase.rpc('get_financial_summary', {
        p_month: month,
        p_year: year
      });

      if (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        throw error;
      }

      // Buscar depreciação mensal dos parâmetros do negócio
      let depreciacao_mensal = 0;
      if (businessSettings && businessSettings.depreciacaoTotalMesDepreciado) {
        depreciacao_mensal = Number(businessSettings.depreciacaoTotalMesDepreciado) || 0;
      }
      return {
        ...data,
        depreciacao_mensal
      };
    },
    enabled: month >= 1 && month <= 12 && year >= 2020 && !!businessSettings,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
};
