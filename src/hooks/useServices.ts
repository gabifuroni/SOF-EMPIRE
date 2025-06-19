import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import type { Service } from '@/types';
import { convertServiceFromDb, convertServiceToDb } from '@/utils/typeConverters';

type ServiceDb = Tables<'servicos'>;
type ServiceInsert = TablesInsert<'servicos'>;
type ServiceUpdate = TablesUpdate<'servicos'>;

export const useServices = () => {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async (): Promise<Service[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data.map(convertServiceFromDb);
    },
  });

  const addService = useMutation({
    mutationFn: async (service: Omit<Service, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const serviceData = convertServiceToDb(service);
      const { data, error } = await supabase
        .from('servicos')
        .insert({
          ...serviceData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return convertServiceFromDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, serviceData }: { id: string; serviceData: Omit<Service, 'id'> }) => {
      const updates = convertServiceToDb(serviceData);
      const { data, error } = await supabase
        .from('servicos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertServiceFromDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    services,
    isLoading,
    addService,
    updateService,
    deleteService,
  };
};
