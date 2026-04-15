import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import MaterialTable from '@/components/materials/MaterialTable';
import AddMaterialModal from '@/components/materials/AddMaterialModal';
import { useMaterials } from '@/hooks/useMaterials';
import type { Material } from '@/types';

type MaterialFormData = { name: string; batchQuantity: number; unit: string; batchPrice: number; };

const Materials = () => {
  const { materials, isLoading, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const handleAddMaterial = async (data: MaterialFormData) => {
    try { await addMaterial.mutateAsync({ name: data.name, batchQuantity: data.batchQuantity, unit: data.unit, batchPrice: data.batchPrice } as Omit<Material, 'id'>); setIsAddModalOpen(false); } catch {}
  };

  const handleEditMaterial = async (data: MaterialFormData) => {
    if (!editingMaterial) return;
    try { await updateMaterial.mutateAsync({ id: editingMaterial.id, materialData: { name: data.name, batchQuantity: data.batchQuantity, unit: data.unit, batchPrice: data.batchPrice } as Omit<Material, 'id'> }); setEditingMaterial(null); } catch {}
  };

  const handleDeleteMaterial = async (id: string) => { try { await deleteMaterial.mutateAsync(id); } catch {} };

  if (isLoading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #2a2a38', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px', background: '#0f0f17', minHeight: '100%' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .mat-table{width:100%;border-collapse:collapse}
        .mat-table th{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#606078;padding:12px 16px;text-align:left;background:#1c1c26;border-bottom:1px solid #2a2a38}
        .mat-table td{padding:14px 16px;font-size:13px;color:#f0f0f8;border-bottom:1px solid #2a2a38;vertical-align:middle}
        .mat-table tr:last-child td{border-bottom:none}
        .mat-table tr:hover td{background:rgba(255,255,255,0.02)}
        .mat-btn{background:rgba(255,255,255,0.05);border:1px solid #2a2a38;border-radius:6px;padding:6px 8px;cursor:pointer;color:#9090a8;display:inline-flex;align-items:center;transition:all 0.15s}
        .mat-btn:hover{border-color:#3a3a4a;color:#f0f0f8}
        .mat-btn.danger:hover{background:rgba(255,77,106,0.08);border-color:rgba(255,77,106,0.3);color:#ff4d6a}
        .mat-mobile-card{background:#1c1c26;border:1px solid #2a2a38;border-radius:10px;padding:16px;margin-bottom:10px}
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28, animation: 'fadeUp 0.4s ease both' }}>
        <div>
          <h1 style={{ fontFamily: 'serif', fontSize: 26, fontWeight: 600, color: '#f0f0f8', marginBottom: 6 }}>Matéria-Prima</h1>
          <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg,#c9a84c,transparent)', borderRadius: 2, marginBottom: 6 }} />
          <p style={{ fontSize: 13, color: '#9090a8' }}>Gerencie os materiais utilizados em seus serviços</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6520)', color: '#0a0a0f', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter,sans-serif' }}>
          <Plus size={16} /> Nova Matéria-Prima
        </button>
      </div>

      {/* Card */}
      <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, overflow: 'hidden', animation: 'fadeUp 0.4s 0.05s ease both' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #2a2a38', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Package size={16} style={{ color: '#c9a84c' }} />
          <h2 style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8' }}>Lista de Matérias-Primas</h2>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9090a8', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 20, padding: '2px 10px' }}>{materials.length} itens</span>
        </div>

        {materials.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧴</div>
            <h3 style={{ fontFamily: 'serif', fontSize: 16, fontWeight: 600, color: '#f0f0f8', marginBottom: 8 }}>Nenhuma matéria-prima cadastrada</h3>
            <p style={{ fontSize: 13, color: '#9090a8' }}>Adicione os materiais utilizados nos seus serviços</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div style={{ display: 'block', padding: '12px' }} className="md-hidden">
              <style>{`.md-hidden{display:block}@media(min-width:768px){.md-hidden{display:none!important}}`}</style>
              {materials.map(m => (
                <div key={m.id} className="mat-mobile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'serif', fontSize: 15, fontWeight: 600, color: '#f0f0f8' }}>{m.name}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="mat-btn" onClick={() => setEditingMaterial(m)}><Edit size={13} /></button>
                      <button className="mat-btn danger" onClick={() => handleDeleteMaterial(m.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { label: 'Preço do Lote', value: `R$ ${m.batchPrice.toFixed(2)}` },
                      { label: 'Qtd. do Lote', value: `${m.batchQuantity} ${m.unit}` },
                      { label: 'Custo/Unidade', value: `R$ ${m.unitCost.toFixed(2)} / ${m.unit}`, color: '#c9a84c' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 10, color: '#606078', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: item.color || '#f0f0f8' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div style={{ display: 'none' }} className="md-visible">
              <style>{`.md-visible{display:none!important}@media(min-width:768px){.md-visible{display:block!important}}`}</style>
              <table className="mat-table">
                <thead>
                  <tr>
                    <th>Nome do Produto/Material</th>
                    <th>Quantidade por Lote</th>
                    <th>Valor Pago no Lote</th>
                    <th>Custo por Unidade</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td style={{ color: '#9090a8' }}>{m.batchQuantity} {m.unit}</td>
                      <td>R$ {m.batchPrice.toFixed(2)}</td>
                      <td style={{ color: '#c9a84c', fontWeight: 500 }}>R$ {m.unitCost.toFixed(2)} / {m.unit}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="mat-btn" onClick={() => setEditingMaterial(m)}><Edit size={13} /></button>
                          <button className="mat-btn danger" onClick={() => handleDeleteMaterial(m.id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <AddMaterialModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddMaterial} title="Adicionar Nova Matéria-Prima" />
      {editingMaterial && (
        <AddMaterialModal isOpen={true} onClose={() => setEditingMaterial(null)} onSave={handleEditMaterial} title="Editar Matéria-Prima"
          initialData={{ name: editingMaterial.name, batchQuantity: editingMaterial.batchQuantity, unit: editingMaterial.unit, batchPrice: editingMaterial.batchPrice }} />
      )}
    </div>
  );
};

export default Materials;
