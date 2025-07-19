/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { Material, MaterialCost } from '@/types';

interface MaterialCostSectionProps {
  materialCosts: MaterialCost[];
  materials: Material[];
  onMaterialCostsChange: (costs: MaterialCost[]) => void;
}

const MaterialCostSection = ({ materialCosts, materials, onMaterialCostsChange }: MaterialCostSectionProps) => {
  const addMaterial = () => {
    onMaterialCostsChange([...materialCosts, { materialId: '', quantity: 1, cost: 0 }]);
  };

  const removeMaterial = (index: number) => {
    onMaterialCostsChange(materialCosts.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof MaterialCost, value: any) => {
    const updated = [...materialCosts];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'materialId' || field === 'quantity') {
      const material = materials.find(m => m.id === updated[index].materialId);
      if (material && updated[index].quantity > 0) {
        updated[index].cost = material.unitCost * updated[index].quantity;
      }
    }
    
    onMaterialCostsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-elite-charcoal-800">Matéria-Prima Utilizada</h3>
        <Button
          type="button"
          onClick={addMaterial}
          variant="outline"
          size="sm"
          className="border-elite-pearl-400 text-elite-charcoal-700 hover:bg-elite-pearl-100 hover:border-elite-pearl-500"
        >
          <Plus size={16} className="mr-2" />
          Adicionar Material
        </Button>
      </div>

      {materialCosts.map((materialCost, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-elite-pearl-100 rounded-lg border border-elite-pearl-200">
          <div className="space-y-2">
            <Label>Material</Label>
            <Select
              value={materialCost.materialId}
              onValueChange={(value) => updateMaterial(index, 'materialId', value)}
            >
              <SelectTrigger className="bg-transparent border-elite-pearl-300 focus:border-elite-rose-400">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name} - R$ {material.unitCost.toFixed(2)} ({material.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input
              type="number"
              step="0.01"
              value={materialCost.quantity}
              onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
              placeholder="1"
              className="bg-transparent border-elite-pearl-300 focus:border-elite-rose-400"
            />
          </div>

          <div className="space-y-2">
            <Label>Custo Total</Label>
            <Input
              value={`R$ ${materialCost.cost.toFixed(2)}`}
              readOnly
              className="bg-elite-pearl-200 border-elite-pearl-300"
            />
          </div>

          <Button
            type="button"
            onClick={() => removeMaterial(index)}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default MaterialCostSection;
