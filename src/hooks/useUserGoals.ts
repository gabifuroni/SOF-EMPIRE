import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserGoals {
  id?: string;
  tipoMeta: 'financeira' | 'atendimentos';
  valorMetaMensal: number;
  metaAtendimentosMensal?: number;
}

export const useUserGoals = () => {
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['user-goals'],
    queryFn: async (): Promise<UserGoals | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('metas_usuario')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      if (!data) return null;

      return {
        id: data.id,
        tipoMeta: data.tipo_meta as 'financeira' | 'atendimentos',
        valorMetaMensal: Number(data.valor_meta_mensal),
        metaAtendimentosMensal: data.meta_atendimentos_mensal || undefined,
      };
    },
  });

  const saveGoals = useMutation({
    mutationFn: async (newGoals: Omit<UserGoals, 'id'>) => {
      console.log('🔄 saveGoals mutation iniciada');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Usuário não autenticado');
        throw new Error('User not authenticated');
      }
      console.log('✅ Usuário autenticado:', user.id);

      const goalData = {
        user_id: user.id,
        tipo_meta: newGoals.tipoMeta,
        valor_meta_mensal: newGoals.valorMetaMensal,
        meta_atendimentos_mensal: newGoals.metaAtendimentosMensal || null,
      };
      console.log('📊 Dados para upsert:', goalData);

      // Primeiro, tentar fazer update
      const { data: updateData, error: updateError } = await supabase
        .from('metas_usuario')
        .update({
          tipo_meta: newGoals.tipoMeta,
          valor_meta_mensal: newGoals.valorMetaMensal,
          meta_atendimentos_mensal: newGoals.metaAtendimentosMensal || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError && updateError.code === 'PGRST116') {
        // Registro não existe, fazer insert
        console.log('📝 Registro não existe, fazendo insert');
        const { data: insertData, error: insertError } = await supabase
          .from('metas_usuario')
          .insert(goalData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erro no insert:', insertError);
          throw insertError;
        }
        console.log('✅ Insert realizado com sucesso:', insertData);
        return insertData;
      } else if (updateError) {
        console.error('❌ Erro no update:', updateError);
        throw updateError;
      }

      console.log('✅ Update realizado com sucesso:', updateData);
      return updateData;
    },
    onSuccess: (data) => {
      console.log('✅ saveGoals mutation concluída com sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
    },
    onError: (error) => {
      console.error('❌ Erro na saveGoals mutation:', error);
    },
  });

  return {
    goals,
    isLoading,
    saveGoals,
  };
};
