import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MaterialTable from '@/components/materials/MaterialTable';
import AddMaterialModal from '@/components/materials/AddMaterialModal';
import { Material } from '@/types';

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      name: 'Esmalte Premium Rosa',
      batchQuantity: 12,
      unit: 'ml',
      batchPrice: 45.90,
      unitCost: 3.83
    },
    {
      id: '2',
      name: 'Base Coat Profissional',
      batchQuantity: 15,
      unit: 'ml',
      batchPrice: 32.50,
      unitCost: 2.17
    },
    {
      id: '3',
      name: 'Top Coat Brilho',
      batchQuantity: 15,
      unit: 'ml',
      batchPrice: 28.90,
      unitCost: 1.93
    }
  ]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const handleAddMaterial = (materialData: Omit<Material, 'id' | 'unitCost'>) => {
    const unitCost = materialData.batchPrice / materialData.batchQuantity;
    const newMaterial: Material = {
      ...materialData,
      id: Date.now().toString(),
      unitCost
    };
    
    setMaterials(prev => [...prev, newMaterial]);
    setIsAddModalOpen(false);
  };

  const handleEditMaterial = (materialData: Omit<Material, 'id' | 'unitCost'>) => {
    if (!editingMaterial) return;
    
    const unitCost = materialData.batchPrice / materialData.batchQuantity;
    const updatedMaterial: Material = {
      ...materialData,
      id: editingMaterial.id,
      unitCost
    };
    
    setMaterials(prev => prev.map(material => 
      material.id === editingMaterial.id ? updatedMaterial : material
    ));
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(material => material.id !== id));
  };

  const openEditModal = (material: Material) => {
    setEditingMaterial(material);
  };

  const closeEditModal = () => {
    setEditingMaterial(null);
  };

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
          initialData={editingMaterial}
        />
      )}
    </div>
  );
};

export default Materials;
