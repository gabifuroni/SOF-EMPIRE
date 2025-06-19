import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BusinessSettings {
  id?: string;
  lucroDesejado: number;
  taxaImpostos: number;
  taxaMediaPonderada: number;
  depreciacaoValorMobilizado: number;
  depreciacaoTotalMesDepreciado: number;
  depreciacaoMensal: number;
  diasTrabalhadosAno: number;
  equipeNumeroProfissionais: number;
  // Novos campos para dias da semana
  trabalhaSegunda?: boolean;
  trabalhaTerca?: boolean;
  trabalhaQuarta?: boolean;
  trabalhaQuinta?: boolean;
  trabalhaSexta?: boolean;
  trabalhaSabado?: boolean;
  trabalhaDomingo?: boolean;
  // Campo para feriados
  feriados?: Array<{id: string, date: string, name: string}>;
}

// Tipo para dados vindos do banco (que pode ter campos extras)
type DatabaseBusinessSettings = BusinessSettings & {
  [key: string]: unknown;
};

export const useBusinessSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['business-settings'],
    queryFn: async (): Promise<BusinessSettings | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');      const { data, error } = await supabase
        .from('parametros_negocio')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      if (!data) return null;      // Parse feriados from JSON if exists
      let feriados = [];
      try {
        const dbData = data as unknown as DatabaseBusinessSettings;
        feriados = dbData.feriados ? JSON.parse(dbData.feriados as unknown as string) : [
          { id: '1', date: '2024-01-01', name: 'Confraternização Universal' },
          { id: '2', date: '2024-04-21', name: 'Tiradentes' },
          { id: '3', date: '2024-09-07', name: 'Independência do Brasil' }
        ];
      } catch (e) {
        feriados = [
          { id: '1', date: '2024-01-01', name: 'Confraternização Universal' },
          { id: '2', date: '2024-04-21', name: 'Tiradentes' },
          { id: '3', date: '2024-09-07', name: 'Independência do Brasil' }
        ];
      }

      const dbData = data as unknown as DatabaseBusinessSettings;
      return {
        id: data.id,
        lucroDesejado: Number(data.lucro_desejado),
        taxaImpostos: Number(data.taxa_impostos),
        taxaMediaPonderada: Number(data.taxa_media_ponderada),
        depreciacaoValorMobilizado: Number(data.depreciacao_valor_mobilizado),
        depreciacaoTotalMesDepreciado: Number(data.depreciacao_total_mes_depreciado),
        depreciacaoMensal: Number(data.depreciacao_mensal),
        diasTrabalhadosAno: data.dias_trabalhados_ano,
        equipeNumeroProfissionais: data.equipe_numero_profissionais,
        // Dias da semana trabalhados (com fallback para valores padrão)
        trabalhaSegunda: (dbData.trabalha_segunda as boolean) ?? true,
        trabalhaTerca: (dbData.trabalha_terca as boolean) ?? true,
        trabalhaQuarta: (dbData.trabalha_quarta as boolean) ?? true,
        trabalhaQuinta: (dbData.trabalha_quinta as boolean) ?? true,
        trabalhaSexta: (dbData.trabalha_sexta as boolean) ?? true,
        trabalhaSabado: (dbData.trabalha_sabado as boolean) ?? false,
        trabalhaDomingo: (dbData.trabalha_domingo as boolean) ?? false,
        feriados: feriados,
      };
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: Omit<BusinessSettings, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');      const { data, error } = await supabase
        .from('parametros_negocio')
        .upsert({
          user_id: user.id,
          lucro_desejado: newSettings.lucroDesejado,
          taxa_impostos: newSettings.taxaImpostos,
          taxa_media_ponderada: newSettings.taxaMediaPonderada,
          depreciacao_valor_mobilizado: newSettings.depreciacaoValorMobilizado,
          depreciacao_total_mes_depreciado: newSettings.depreciacaoTotalMesDepreciado,
          depreciacao_mensal: newSettings.depreciacaoMensal,
          dias_trabalhados_ano: newSettings.diasTrabalhadosAno,
          equipe_numero_profissionais: newSettings.equipeNumeroProfissionais,          // Campos de dias da semana
          trabalha_segunda: newSettings.trabalhaSegunda ?? true,
          trabalha_terca: newSettings.trabalhaTerca ?? true,
          trabalha_quarta: newSettings.trabalhaQuarta ?? true,
          trabalha_quinta: newSettings.trabalhaQuinta ?? true,
          trabalha_sexta: newSettings.trabalhaSexta ?? true,
          trabalha_sabado: newSettings.trabalhaSabado ?? false,
          trabalha_domingo: newSettings.trabalhaDomingo ?? false,
          // Campo de feriados como JSON
          feriados: JSON.stringify(newSettings.feriados ?? []),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
    },
  });

  return {
    settings,
    isLoading,
    saveSettings,
  };
};
