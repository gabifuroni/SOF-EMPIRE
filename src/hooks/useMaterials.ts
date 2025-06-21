import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import type { Material } from '@/types';
import { convertMaterialFromDb, convertMaterialToDb } from '@/utils/typeConverters';

type MaterialDb = Tables<'materias_primas'>;
type MaterialInsert = TablesInsert<'materias_primas'>;
type MaterialUpdate = TablesUpdate<'materias_primas'>;

export const useMaterials = () => {
  const queryClient = useQueryClient();  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async (): Promise<Material[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('materias_primas')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data.map(convertMaterialFromDb);
    },
  });  const addMaterial = useMutation({
    mutationFn: async (material: Omit<Material, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const materialData = convertMaterialToDb(material);
      
      const { data, error } = await supabase
        .from('materias_primas')
        .insert({
          ...materialData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return convertMaterialFromDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, materialData }: { id: string; materialData: Omit<Material, 'id'> }) => {
      const updates = convertMaterialToDb(materialData);
      const { data, error } = await supabase
        .from('materias_primas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return convertMaterialFromDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materias_primas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  return {
    materials,
    isLoading,
    addMaterial,
    updateMaterial,
    deleteMaterial,
  };
};
