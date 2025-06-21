import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
      const materialToAdd: Omit<Material, 'id' | 'unitCost'> = {
        name: materialData.name,
        batchQuantity: materialData.batchQuantity,
        unit: materialData.unit,
        batchPrice: materialData.batchPrice,
        // unitCost será calculado automaticamente pelo banco
      };
      
      await addMaterial.mutateAsync(materialToAdd as Omit<Material, 'id'>);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding material:', error);
      // Manter o modal aberto em caso de erro
    }
  };

  const handleEditMaterial = async (materialData: MaterialFormData) => {
    if (!editingMaterial) return;
    
    try {
      const materialToUpdate: Omit<Material, 'id' | 'unitCost'> = {
        name: materialData.name,
        batchQuantity: materialData.batchQuantity,
        unit: materialData.unit,
        batchPrice: materialData.batchPrice,
        // unitCost será calculado automaticamente pelo banco
      };
      await updateMaterial.mutateAsync({
        id: editingMaterial.id,
        materialData: materialToUpdate as Omit<Material, 'id'>,
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
      <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Lista de Matérias-Primas
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        {/* Mobile View: Card List */}
        <div className="space-y-4 md:hidden">
          {materials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-symbol-gray-600">Nenhuma matéria-prima cadastrada ainda.</p>
            </div>
          ) : (
            materials.map((material) => (
              <div key={material.id} className="symbol-card p-4 bg-symbol-gray-50 border border-symbol-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="brand-subheading text-symbol-black font-medium text-sm">{material.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(material)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-symbol-gray-600 space-y-1">
                  <p><span className="font-medium">Preço do Lote:</span> R$ {material.batchPrice.toFixed(2)}</p>
                  <p><span className="font-medium">Qtd. do Lote:</span> {material.batchQuantity} {material.unit}</p>
                  <p><span className="font-medium">Custo/Unidade:</span> R$ {material.unitCost.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
          {materials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-symbol-gray-600">Nenhuma matéria-prima cadastrada ainda.</p>
            </div>
          ) : (
            <MaterialTable 
              materials={materials}
              onEdit={openEditModal}
              onDelete={handleDeleteMaterial}
            />
          )}
        </div>
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
