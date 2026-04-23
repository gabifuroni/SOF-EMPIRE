import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Save, Plus, X } from 'lucide-react';

export interface Colaboradora {
  id: string;
  nome: string;
  meta: number;
}

interface TeamSectionProps {
  nomesProfissionais: Colaboradora[];
  setNomesProfissionais: (names: Colaboradora[]) => void;
  isSaving: boolean;
  onSave: () => void;
}

export const TeamSection = ({
  nomesProfissionais,
  setNomesProfissionais,
  isSaving,
  onSave
}: TeamSectionProps) => {
  const [novoNome, setNovoNome] = useState('');

  const handleAdd = () => {
    const nome = novoNome.trim();
    if (!nome) return;
    setNomesProfissionais([...nomesProfissionais, { id: crypto.randomUUID(), nome, meta: 0 }]);
    setNovoNome('');
  };

  const handleRemove = (id: string) => {
    setNomesProfissionais(nomesProfissionais.filter(c => c.id !== id));
  };

  const handleMetaChange = (id: string, meta: number) => {
    setNomesProfissionais(nomesProfissionais.map(c => c.id === id ? { ...c, meta } : c));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  const inputStyle: React.CSSProperties = {
    background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8,
    padding: '9px 13px', color: '#f0f0f8', fontSize: 13, outline: 'none',
    fontFamily: 'Sora, sans-serif',
  };

  return (
    <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-symbol-gold" size={20} />
          <h2 className="brand-heading text-xl text-symbol-black">Equipe</h2>
        </div>
        <div className="w-8 h-px bg-symbol-beige"></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520 }}>
        {/* Contador */}
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8', display: 'flex', alignItems: 'center', gap: 8 }}>
          Colaboradoras
          <span style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            {nomesProfissionais.length}
          </span>
        </div>

        {/* Lista */}
        {nomesProfissionais.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: 8, padding: '0 4px' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#606078', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Nome</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#606078', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right' }}>Meta Mensal (R$)</span>
              <span />
            </div>
            {nomesProfissionais.map((col) => (
              <div key={col.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: 8, alignItems: 'center', background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 13, color: '#f0f0f8', fontFamily: 'Sora, sans-serif' }}>{col.nome}</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={col.meta || ''}
                  onChange={e => handleMetaChange(col.id, parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  style={{ ...inputStyle, padding: '6px 10px', textAlign: 'right', width: '100%' }}
                />
                <button
                  onClick={() => handleRemove(col.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#606078', padding: 2, display: 'flex', borderRadius: 4, justifyContent: 'center' }}
                  title="Remover"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input para adicionar */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Nome da colaboradora"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleAdd}
            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8, padding: '9px 13px', cursor: 'pointer', color: '#c9a84c', display: 'flex', alignItems: 'center' }}
            title="Adicionar"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Salvar */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Dados da Equipe'}
        </Button>
      </div>
    </div>
  );
};
