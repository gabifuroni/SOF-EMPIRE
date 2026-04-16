import { Plus, Trash2 } from 'lucide-react';
import { Material, MaterialCost } from '@/types';

interface MaterialCostSectionProps {
  materialCosts: MaterialCost[];
  materials: Material[];
  onMaterialCostsChange: (costs: MaterialCost[]) => void;
}

const MaterialCostSection = ({ materialCosts, materials, onMaterialCostsChange }: MaterialCostSectionProps) => {
  const addMaterial = () => onMaterialCostsChange([{ materialId: "", quantity: 1, cost: 0 }, ...materialCosts]);

  const removeMaterial = (index: number) => onMaterialCostsChange(materialCosts.filter((_, i) => i !== index));

  const updateMaterial = (index: number, field: keyof MaterialCost, value: any) => {
    const updated = [...materialCosts];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'materialId' || field === 'quantity') {
      const material = materials.find(m => m.id === updated[index].materialId);
      if (material && updated[index].quantity > 0) updated[index].cost = material.unitCost * updated[index].quantity;
    }
    onMaterialCostsChange(updated);
  };

  const inputStyle: React.CSSProperties = { background: '#13131a', border: '1px solid #2a2a38', borderRadius: 8, padding: '9px 12px', color: '#f0f0f8', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8', marginBottom: 6, display: 'block' };

  return (
    <div style={{ marginBottom: 16 }}>
      <style>{`
        .mat-select:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.15) !important; }
        .mat-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.15) !important; }
        .mat-del-btn:hover { background: rgba(255,77,106,0.15) !important; border-color: rgba(255,77,106,0.3) !important; color: #ff4d6a !important; }
      `}</style>

      {/* Header */}
      <h3 style={{ fontFamily: 'serif', fontSize: 15, fontWeight: 600, color: '#f0f0f8', marginBottom: 12 }}>Matéria-Prima Utilizada</h3>

      {/* Material rows - newest first */}
      {materialCosts.map((mc, index) => (
        <div key={index} style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 10, padding: '14px 16px', marginBottom: 8, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Material</label>
            <select
              className="mat-select"
              value={mc.materialId}
              onChange={e => updateMaterial(index, 'materialId', e.target.value)}
              style={{ ...inputStyle }}
            >
              <option value="" style={{ background: '#1c1c26' }}>Selecione...</option>
              {materials.map(m => (
                <option key={m.id} value={m.id} style={{ background: '#1c1c26' }}>
                  {m.name} — R$ {m.unitCost.toFixed(2)} / {m.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Quantidade</label>
            <input
              className="mat-input"
              type="number"
              step="0.01"
              value={mc.quantity}
              onChange={e => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Custo Total</label>
            <input
              style={{ ...inputStyle, background: '#13131a', color: '#00c896', fontWeight: 600, cursor: 'not-allowed' }}
              value={`R$ ${mc.cost.toFixed(2)}`}
              readOnly
            />
          </div>

          <button
            type="button"
            className="mat-del-btn"
            onClick={() => removeMaterial(index)}
            style={{ background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: 8, padding: '9px 10px', cursor: 'pointer', color: '#ff4d6a', display: 'flex', alignItems: 'center', transition: 'all 0.15s', alignSelf: 'flex-end' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      {/* Empty state */}
      {materialCosts.length === 0 && (
        <div style={{ background: '#1c1c26', border: '1px dashed #2a2a38', borderRadius: 10, padding: '16px', textAlign: 'center', color: '#606078', fontSize: 13, marginBottom: 10 }}>
          Nenhuma matéria-prima adicionada.
        </div>
      )}

      {/* Add button - always at bottom of list */}
      <button type="button" onClick={addMaterial} style={{ background: 'rgba(201,168,76,0.08)', border: '1px dashed rgba(201,168,76,0.3)', borderRadius: 10, padding: '10px', fontSize: 12, fontWeight: 600, color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Inter,sans-serif', width: '100%', marginTop: 4 }}>
        <Plus size={14} /> Adicionar Material
      </button>
    </div>
  );
};

export default MaterialCostSection;
