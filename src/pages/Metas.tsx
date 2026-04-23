import { useState, useEffect } from 'react';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { useMetasColaboradoras, MetaColaboradora } from '@/hooks/useMetasColaboradoras';
import { Target, Save, ChevronLeft, ChevronRight } from 'lucide-react';

interface Colaboradora { id: string; nome: string; }

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

const normalizeColaboradoras = (raw: unknown): Colaboradora[] => {
  if (!Array.isArray(raw)) return [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  return raw.map((item) => {
    if (typeof item === 'string') {
      const nome = item.trim();
      if (!nome || seenNames.has(nome.toLowerCase())) return null;
      seenNames.add(nome.toLowerCase());
      return { id: crypto.randomUUID(), nome };
    }
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      const nome = ((obj.nome as string) || '').trim();
      const id = (obj.id as string) || crypto.randomUUID();
      if (!nome || seenIds.has(id) || seenNames.has(nome.toLowerCase())) return null;
      seenIds.add(id);
      seenNames.add(nome.toLowerCase());
      return { id, nome };
    }
    return null;
  }).filter(Boolean) as Colaboradora[];
};

const Metas = () => {
  const { params } = useBusinessParams();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [year, setYear] = useState(now.getFullYear());

  const mesReferencia = `${year}-${String(month + 1).padStart(2, '0')}`;
  const { metas, upsertAllMetas } = useMetasColaboradoras(mesReferencia);

  const colaboradoras = normalizeColaboradoras(params.equipeNomesProfissionais);

  // Local state for editing
  const [localMetas, setLocalMetas] = useState<Record<string, { faturamento: number; atendimentos: number }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync when metas from DB load
  useEffect(() => {
    const map: Record<string, { faturamento: number; atendimentos: number }> = {};
    colaboradoras.forEach(col => {
      const saved = metas.find(m => m.colaboradora_id === col.id);
      map[col.id] = {
        faturamento: saved?.meta_faturamento ?? 0,
        atendimentos: saved?.meta_atendimentos ?? 0,
      };
    });
    setLocalMetas(map);
  }, [metas, params.equipeNomesProfissionais]);

  const handleChange = (id: string, field: 'faturamento' | 'atendimentos', value: number) => {
    setLocalMetas(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const allMetas: MetaColaboradora[] = colaboradoras.map(col => ({
        colaboradora_id: col.id,
        colaboradora_nome: col.nome,
        mes_referencia: mesReferencia,
        meta_faturamento: localMetas[col.id]?.faturamento ?? 0,
        meta_atendimentos: localMetas[col.id]?.atendimentos ?? 0,
      }));
      await upsertAllMetas.mutateAsync(allMetas);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
    } catch (e: any) {
      console.error('Erro ao salvar metas:', e);
      setSaveError(e?.message || 'Erro ao salvar. Tente novamente.');
      setTimeout(() => setSaveError(null), 5000);
    }
    finally { setIsSaving(false); }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const totalFaturamento = colaboradoras.reduce((s, c) => s + (localMetas[c.id]?.faturamento ?? 0), 0);
  const totalAtendimentos = colaboradoras.reduce((s, c) => s + (localMetas[c.id]?.atendimentos ?? 0), 0);

  const inputStyle = (color = '#c9a84c'): React.CSSProperties => ({
    background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8,
    padding: '8px 12px', color, fontSize: 15, fontWeight: 600,
    outline: 'none', fontFamily: 'Sora, sans-serif', textAlign: 'right', width: 130,
  });

  return (
    <div style={{ padding: '32px 24px', fontFamily: 'Sora, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Target size={20} color="#c9a84c" />
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f8', margin: 0 }}>Metas da Equipe</h1>
          </div>
          <p style={{ fontSize: 13, color: '#9090a8', margin: 0 }}>Defina metas mensais individuais de faturamento e atendimentos</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Seletor de mês */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 10, padding: '6px 10px' }}>
            <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9090a8', display: 'flex', padding: 2 }}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f8', minWidth: 120, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9090a8', display: 'flex', padding: 2 }}><ChevronRight size={14} /></button>
          </div>
          {colaboradoras.length > 0 && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{ background: savedOk ? 'rgba(0,200,150,0.15)' : 'linear-gradient(135deg,#c9a84c,#a8852e)', border: savedOk ? '1px solid #00c896' : 'none', borderRadius: 10, padding: '10px 18px', fontSize: 12, fontWeight: 600, color: savedOk ? '#00c896' : '#0a0a0f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Sora, sans-serif' }}
            >
              <Save size={14} />{isSaving ? 'Salvando...' : savedOk ? 'Salvo!' : 'Salvar Metas'}
            </button>
          )}
        </div>
      </div>

      {/* Erro de salvamento */}
      {saveError && (
        <div style={{ background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#ff8fa3' }}>
          ⚠️ {saveError}
        </div>
      )}

      {/* Resumo */}
      {colaboradoras.length > 0 && (
        <div style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#606078', marginBottom: 4 }}>Meta de Faturamento Total</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#c9a84c' }}>R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ width: 1, height: 36, background: '#2a2a38' }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#606078', marginBottom: 4 }}>Meta de Atendimentos Total</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#9090a8' }}>{totalAtendimentos} atend.</div>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#c9a84c', fontWeight: 600 }}>
            {colaboradoras.length} colaboradora{colaboradoras.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Lista */}
      {colaboradoras.length === 0 ? (
        <div style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 15, color: '#f0f0f8', marginBottom: 6 }}>Nenhuma colaboradora cadastrada</div>
          <div style={{ fontSize: 12, color: '#606078' }}>Adicione em <strong style={{ color: '#9090a8' }}>Parâmetros do Negócio → Equipe</strong></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {colaboradoras.map((col) => (
            <div key={col.id} style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                {/* Avatar + Nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(201,168,76,0.3),rgba(201,168,76,0.1))', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#c9a84c', fontWeight: 600 }}>
                    {col.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f8' }}>{col.nome}</div>
                    <div style={{ fontSize: 11, color: '#606078' }}>Colaboradora</div>
                  </div>
                </div>

                {/* Metas */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#606078', marginBottom: 5, textAlign: 'right' }}>Faturamento (R$)</div>
                    <input
                      type="number" min="0" step="100"
                      value={localMetas[col.id]?.faturamento || ''}
                      onChange={e => handleChange(col.id, 'faturamento', parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      style={inputStyle('#c9a84c')}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#606078', marginBottom: 5, textAlign: 'right' }}>Atendimentos</div>
                    <input
                      type="number" min="0" step="1"
                      value={localMetas[col.id]?.atendimentos || ''}
                      onChange={e => handleChange(col.id, 'atendimentos', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      style={inputStyle('#9090a8')}
                    />
                  </div>
                </div>
              </div>

              {/* Progresso */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#606078', marginBottom: 5 }}>
                  <span>Progresso do mês</span>
                  <span>Acompanhamento disponível em breve</span>
                </div>
                <div style={{ height: 4, background: '#1c1c26', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg,#c9a84c,#e8c96a)', borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Metas;
