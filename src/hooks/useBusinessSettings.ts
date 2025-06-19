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
}

export const useBusinessSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['business-settings'],
    queryFn: async (): Promise<BusinessSettings | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('parametros_negocio')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      if (!data) return null;

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
          equipe_numero_profissionais: newSettings.equipeNumeroProfissionais,
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
