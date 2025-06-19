import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MaterialTable from '@/components/materials/MaterialTable';
import AddMaterialModal from '@/components/materials/AddMaterialModal';
import { useMaterials } from '@/hooks/useMaterials';
import type { Material } from '@/types';

type MaterialFormData = {
  name: string;
  batchQuantity: number;
  unit: string;
  batchPrice: number;
};

const Materials = () => {
  const { materials, isLoading, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const handleAddMaterial = async (materialData: MaterialFormData) => {
    try {
      const materialToAdd: Omit<Material, 'id'> = {
        name: materialData.name,
        batchQuantity: materialData.batchQuantity,
        unit: materialData.unit,
        batchPrice: materialData.batchPrice,
        unitCost: materialData.batchPrice / materialData.batchQuantity,
      };
      await addMaterial.mutateAsync(materialToAdd);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  const handleEditMaterial = async (materialData: MaterialFormData) => {
    if (!editingMaterial) return;
    
    try {
      const materialToUpdate: Omit<Material, 'id'> = {
        name: materialData.name,
        batchQuantity: materialData.batchQuantity,
        unit: materialData.unit,
        batchPrice: materialData.batchPrice,
        unitCost: materialData.batchPrice / materialData.batchQuantity,
      };
      await updateMaterial.mutateAsync({
        id: editingMaterial.id,
        materialData: materialToUpdate,
      });
      setEditingMaterial(null);
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteMaterial.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
  };

  const closeEditModal = () => {
    setEditingMaterial(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-symbol-gold border-t-symbol-beige rounded-full animate-spin mx-auto"></div>
          <p className="brand-body text-symbol-gray-600">Carregando matérias-primas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="brand-heading text-3xl text-symbol-black mb-2">
            Matéria-Prima
          </h1>
          <div className="w-12 h-px bg-symbol-gold mb-4"></div>
          <p className="brand-body text-symbol-gray-600">
            Gerencie os materiais utilizados em seus serviços
          </p>
        </div>
        
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-3 px-6 transition-all duration-300 uppercase tracking-wide text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Matéria-Prima
        </Button>
      </div>

      {/* Materials Table */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Lista de Matérias-Primas
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        <MaterialTable 
          materials={materials}
          onEdit={openEditModal}
          onDelete={handleDeleteMaterial}
        />
      </div>

      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMaterial}
        title="Adicionar Nova Matéria-Prima"
      />

      {editingMaterial && (
        <AddMaterialModal
          isOpen={true}
          onClose={closeEditModal}
          onSave={handleEditMaterial}
          title="Editar Matéria-Prima"
          initialData={{
            name: editingMaterial.name,
            batchQuantity: editingMaterial.batchQuantity,
            unit: editingMaterial.unit,
            batchPrice: editingMaterial.batchPrice,
          }}
        />
      )}
    </div>
  );
};

export default Materials;
