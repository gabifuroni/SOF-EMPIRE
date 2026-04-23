import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ContaControlInsert } from '@/hooks/useContaControl';

interface Category {
  id: string;
  nome: string;
}

export interface AddContaData extends Omit<ContaControlInsert, 'mes_referencia'> {
  recorrente: boolean;
}

interface AddContaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddContaData) => void;
  mesReferencia: string;
  indiretasCategorias: Category[];
  diretasCategorias: Category[];
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1c1c26', border: '1px solid #2a2a38',
  borderRadius: 8, padding: '10px 14px', color: '#f0f0f8', fontSize: 14,
  outline: 'none', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, color: '#9090a8', marginBottom: 6, display: 'block',
};

const AddContaModal = ({ isOpen, onClose, onSave, mesReferencia, indiretasCategorias, diretasCategorias }: AddContaModalProps) => {
  const [form, setForm] = useState({
    nome: '',
    observacao: '',
    valor_planejado: '',
    data_vencimento: '',
    tipo_despesa: 'indireta' as 'indireta' | 'direta',
    categoria_id: '',
  });
  const [recorrente, setRecorrente] = useState(false);

  const categorias = form.tipo_despesa === 'indireta' ? indiretasCategorias : diretasCategorias;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.valor_planejado) return;

    onSave({
      nome: form.nome,
      observacao: form.observacao || undefined,
      valor_planejado: parseFloat(form.valor_planejado),
      data_vencimento: form.data_vencimento || undefined,
      tipo_despesa: form.tipo_despesa,
      categoria_id: form.categoria_id || undefined,
      pago: false,
      recorrente,
    });

    setForm({ nome: '', observacao: '', valor_planejado: '', data_vencimento: '', tipo_despesa: 'indireta', categoria_id: '' });
    setRecorrente(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto"
        style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, color: '#f0f0f8' }}
      >
        <style>{`
          .conta-input:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.15) !important; }
          .conta-input::placeholder { color: #606078 !important; }
          .conta-input option { background: #1c1c26; color: #f0f0f8; }
          .tipo-btn { flex: 1; padding: 9px; border-radius: 8px; border: 1px solid #2a2a38; background: transparent; color: #9090a8; font-family: Sora, sans-serif; font-size: 13px; cursor: pointer; transition: all 0.15s; }
          .tipo-btn.active { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.3); color: #c9a84c; font-weight: 600; }
        `}</style>

        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 600, color: '#f0f0f8' }}>
            Adicionar Conta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>

          {/* Nome */}
          <div>
            <label style={labelStyle}>Nome da Conta *</label>
            <input
              className="conta-input"
              style={inputStyle}
              placeholder="Ex: Água, Aluguel, Parcela..."
              value={form.nome}
              onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
              required
            />
          </div>

          {/* Tipo de Despesa */}
          <div>
            <label style={labelStyle}>Tipo de Despesa</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`tipo-btn ${form.tipo_despesa === 'indireta' ? 'active' : ''}`}
                onClick={() => setForm(p => ({ ...p, tipo_despesa: 'indireta', categoria_id: '' }))}
              >
                ↗ Despesa Indireta
              </button>
              <button
                type="button"
                className={`tipo-btn ${form.tipo_despesa === 'direta' ? 'active' : ''}`}
                onClick={() => setForm(p => ({ ...p, tipo_despesa: 'direta', categoria_id: '' }))}
              >
                ↗ Despesa Direta
              </button>
            </div>
          </div>

          {/* Categoria vinculada */}
          <div>
            <label style={labelStyle}>Categoria Vinculada</label>
            <select
              className="conta-input"
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.categoria_id}
              onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}
            >
              <option value="">Sem vínculo (opcional)</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
            <p style={{ fontSize: 11, color: '#606078', marginTop: 4 }}>
              Quando pago, o valor real vai automaticamente para esta categoria
            </p>
          </div>

          {/* Valor planejado + Vencimento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Valor Planejado (R$) *</label>
              <input
                className="conta-input"
                style={inputStyle}
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.valor_planejado}
                onChange={e => setForm(p => ({ ...p, valor_planejado: e.target.value }))}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Data de Vencimento</label>
              <input
                className="conta-input"
                style={inputStyle}
                type="date"
                value={form.data_vencimento}
                onChange={e => setForm(p => ({ ...p, data_vencimento: e.target.value }))}
              />
            </div>
          </div>

          {/* Observação */}
          <div>
            <label style={labelStyle}>Observação</label>
            <input
              className="conta-input"
              style={inputStyle}
              placeholder="Ex: Parcela 1/4, vencimento alterado..."
              value={form.observacao}
              onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
            />
          </div>

          {/* Recorrente */}
          <div
            onClick={() => setRecorrente(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: recorrente ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${recorrente ? 'rgba(201,168,76,0.3)' : '#2a2a38'}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <div style={{ width: 36, height: 20, borderRadius: 99, background: recorrente ? '#c9a84c' : '#2a2a38', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: recorrente ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: recorrente ? '#c9a84c' : '#9090a8' }}>Repetir em todos os meses</div>
              <div style={{ fontSize: 11, color: '#606078', marginTop: 2 }}>Conta aparece automaticamente em jan–dez</div>
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="submit"
              style={{ flex: 1, background: 'linear-gradient(135deg,#c9a84c,#a8852e)', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
            >
              Adicionar Conta
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a38', borderRadius: 10, padding: '12px', fontSize: 14, color: '#9090a8', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContaModal;
