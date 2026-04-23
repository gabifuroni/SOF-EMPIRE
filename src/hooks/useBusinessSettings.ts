import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface BusinessSettings {
  id?: string;
  lucroDesejado: number;
  despesasIndiretasDepreciacao: number;
  taxaImpostos: number;
  taxaMediaPonderada: number;
  depreciacaoValorMobilizado: number;
  depreciacaoTotalMesDepreciado: number;
  depreciacaoMensal: number;
  diasTrabalhadosAno: number;
  equipeNumeroProfissionais: number;
  equipeNomesProfissionais?: string[];
  trabalhaSegunda?: boolean;
  trabalhaTerca?: boolean;
  trabalhaQuarta?: boolean;
  trabalhaQuinta?: boolean;
  trabalhaSexta?: boolean;
  trabalhaSabado?: boolean;
  trabalhaDomingo?: boolean;
  feriados?: Array<{id: string, date: string, name: string}>;
}

type DatabaseBusinessSettings = BusinessSettings & {
  [key: string]: unknown;
};

const DEFAULT_FERIADOS = [
  { id: '1', date: '2025-01-01', name: 'Confraternização Universal' },
  { id: '2', date: '2025-04-21', name: 'Tiradentes' },
  { id: '3', date: '2025-09-07', name: 'Independência do Brasil' },
];

export const useBusinessSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['business-settings', user?.id],
    queryFn: async (): Promise<BusinessSettings | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('parametros_negocio')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      let feriados = DEFAULT_FERIADOS;
      try {
        const dbData = data as unknown as DatabaseBusinessSettings;
        if (dbData.feriados) {
          const parsed = typeof dbData.feriados === 'string'
            ? JSON.parse(dbData.feriados)
            : dbData.feriados;
          if (Array.isArray(parsed) && parsed.length > 0) {
            feriados = parsed;
          }
        }
      } catch {
        // mantém feriados padrão
      }

      const dbData = data as unknown as DatabaseBusinessSettings;
      return {
        id: data.id,
        lucroDesejado: Number(data.lucro_desejado),
        despesasIndiretasDepreciacao: Number(dbData.despesas_indiretas_depreciacao),
        taxaImpostos: Number(data.taxa_impostos),
        taxaMediaPonderada: Number(data.taxa_media_ponderada),
        depreciacaoValorMobilizado: Number(data.depreciacao_valor_mobilizado),
        depreciacaoTotalMesDepreciado: Number(data.depreciacao_total_mes_depreciado),
        depreciacaoMensal: Number(data.depreciacao_mensal),
        diasTrabalhadosAno: data.dias_trabalhados_ano,
        equipeNumeroProfissionais: data.equipe_numero_profissionais,
        equipeNomesProfissionais: (() => {
          try {
            const raw = (data as any).equipe_nomes_profissionais;
            if (!raw) return [];
            return Array.isArray(raw) ? raw : JSON.parse(raw);
          } catch { return []; }
        })(),
        trabalhaSegunda: (dbData.trabalha_segunda as boolean) ?? true,
        trabalhaTerca: (dbData.trabalha_terca as boolean) ?? true,
        trabalhaQuarta: (dbData.trabalha_quarta as boolean) ?? true,
        trabalhaQuinta: (dbData.trabalha_quinta as boolean) ?? true,
        trabalhaSexta: (dbData.trabalha_sexta as boolean) ?? true,
        trabalhaSabado: (dbData.trabalha_sabado as boolean) ?? false,
        trabalhaDomingo: (dbData.trabalha_domingo as boolean) ?? false,
        feriados,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: Omit<BusinessSettings, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('parametros_negocio')
        .upsert({
          user_id: user.id,
          lucro_desejado: newSettings.lucroDesejado,
          despesas_indiretas_depreciacao: newSettings.despesasIndiretasDepreciacao,
          taxa_impostos: newSettings.taxaImpostos,
          taxa_media_ponderada: newSettings.taxaMediaPonderada,
          depreciacao_valor_mobilizado: newSettings.depreciacaoValorMobilizado,
          depreciacao_total_mes_depreciado: newSettings.depreciacaoTotalMesDepreciado,
          depreciacao_mensal: newSettings.depreciacaoMensal,
          dias_trabalhados_ano: newSettings.diasTrabalhadosAno,
          equipe_numero_profissionais: newSettings.equipeNumeroProfissionais,
          equipe_nomes_profissionais: JSON.stringify(newSettings.equipeNomesProfissionais ?? []),
          trabalha_segunda: newSettings.trabalhaSegunda ?? true,
          trabalha_terca: newSettings.trabalhaTerca ?? true,
          trabalha_quarta: newSettings.trabalhaQuarta ?? true,
          trabalha_quinta: newSettings.trabalhaQuinta ?? true,
          trabalha_sexta: newSettings.trabalhaSexta ?? true,
          trabalha_sabado: newSettings.trabalhaSabado ?? false,
          trabalha_domingo: newSettings.trabalhaDomingo ?? false,
          feriados: JSON.stringify(newSettings.feriados ?? []),
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', user?.id] });
    },
  });

  return { settings, isLoading, saveSettings };
};
