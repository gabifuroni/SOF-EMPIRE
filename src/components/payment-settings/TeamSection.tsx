import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Save, Plus, X } from 'lucide-react';

export interface Colaboradora {
  id: string;
  nome: string;
  meta: number;
  ativo: boolean;
  comissao_percentual?: number;
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

  const valid = nomesProfissionais.filter(c => c.nome?.trim());

  const handleAdd = () => {
    const nome = novoNome.trim();
    if (!nome) return;
    setNomesProfissionais([...nomesProfissionais, { id: crypto.randomUUID(), nome, meta: 0, ativo: true, comissao_percentual: 0 }]);
    setNovoNome('');
  };

  const handleRemove = (id: string) => {
    setNomesProfissionais(nomesProfissionais.filter(c => c.id !== id));
  };

  const handleToggleAtivo = (id: string) => {
    setNomesProfissionais(
      nomesProfissionais.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c)
    );
  };

  const handleComissaoChange = (id: string, val: string) => {
    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setNomesProfissionais(
      nomesProfissionais.map(c => c.id === id ? { ...c, comissao_percentual: num } : c)
    );
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
            {valid.length}
          </span>
        </div>

        {/* Lista */}
        {valid.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {valid.map(col => {
              const ativa = col.ativo !== false;
              return (
                <div key={col.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1c1c26', border: `1px solid ${ativa ? '#2a2a38' : '#222230'}`, borderRadius: 8, padding: '8px 12px', opacity: ativa ? 1 : 0.65, flexWrap: 'wrap', gap: 8 }}>
                  {/* Nome + status dot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 120 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: ativa ? '#00c896' : '#606078', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: ativa ? '#f0f0f8' : '#9090a8', fontFamily: 'Sora, sans-serif' }}>{col.nome}</span>
                  </div>
                  {/* Campo de comissão */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#9090a8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Comissão</span>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#13131a', border: '1px solid #2a2a38', borderRadius: 6, overflow: 'hidden' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={col.comissao_percentual ?? 0}
                        onChange={e => handleComissaoChange(col.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 44, background: 'transparent', border: 'none', outline: 'none', color: '#c9a84c', fontSize: 13, fontWeight: 600, padding: '4px 6px', fontFamily: 'Sora, sans-serif', textAlign: 'right' }}
                      />
                      <span style={{ fontSize: 12, color: '#9090a8', paddingRight: 6 }}>%</span>
                    </div>
                  </div>
                  {/* Ações */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Toggle ativo/inativo */}
                    <button
                      onClick={() => handleToggleAtivo(col.id)}
                      title={ativa ? 'Inativar' : 'Ativar'}
                      style={{
                        background: ativa ? 'rgba(0,200,150,0.08)' : 'rgba(201,168,76,0.08)',
                        border: `1px solid ${ativa ? 'rgba(0,200,150,0.25)' : 'rgba(201,168,76,0.25)'}`,
                        borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
                        color: ativa ? '#00c896' : '#c9a84c',
                        fontSize: 10, fontWeight: 700, fontFamily: 'Sora, sans-serif',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}
                    >
                      {ativa ? 'Ativa' : 'Inativa'}
                    </button>
                    {/* Remover */}
                    <button
                      onClick={() => handleRemove(col.id)}
                      title="Remover"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#606078', padding: 2, display: 'flex', borderRadius: 4 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
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
