import { useState, useEffect } from 'react';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Target, Save } from 'lucide-react';

interface Colaboradora {
  id: string;
  nome: string;
  meta: number;
}

const normalizeColaboradoras = (raw: unknown): Colaboradora[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === 'string') return item.trim() ? { id: crypto.randomUUID(), nome: item.trim(), meta: 0 } : null;
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      const nome = ((obj.nome as string) || '').trim();
      if (!nome) return null;
      return { id: (obj.id as string) || crypto.randomUUID(), nome, meta: Number(obj.meta) || 0 };
    }
    return null;
  }).filter(Boolean) as Colaboradora[];
};

const Metas = () => {
  const { params } = useBusinessParams();
  const { saveSettings } = useBusinessSettings();
  const [colaboradoras, setColaboradoras] = useState<Colaboradora[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    const raw = params.equipeNomesProfissionais;
    setColaboradoras(normalizeColaboradoras(raw));
  }, [params.equipeNomesProfissionais]);

  const handleMetaChange = (id: string, meta: number) => {
    setColaboradoras(prev => prev.map(c => c.id === id ? { ...c, meta } : c));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings.mutateAsync({
        lucroDesejado: params.lucroDesejado,
        despesasIndiretasDepreciacao: params.despesasIndiretasDepreciacao,
        taxaImpostos: params.impostosRate,
        taxaMediaPonderada: params.weightedAverageRate,
        depreciacaoValorMobilizado: params.depreciacaoValorMobilizado,
        depreciacaoTotalMesDepreciado: params.depreciacaoTotalMesDepreciado,
        depreciacaoMensal: params.depreciacaoMensal,
        diasTrabalhadosAno: params.workingDaysPerYear,
        equipeNumeroProfissionais: colaboradoras.length || 1,
        equipeNomesProfissionais: colaboradoras,
        trabalhaSegunda: params.trabalhaSegunda,
        trabalhaTerca: params.trabalhaTerca,
        trabalhaQuarta: params.trabalhaQuarta,
        trabalhaQuinta: params.trabalhaQuinta,
        trabalhaSexta: params.trabalhaSexta,
        trabalhaSabado: params.trabalhaSabado,
        trabalhaDomingo: params.trabalhaDomingo,
        feriados: params.feriados,
      });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const totalMeta = colaboradoras.reduce((sum, c) => sum + (c.meta || 0), 0);

  return (
    <div style={{ padding: '32px 24px', fontFamily: 'Sora, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Target size={20} color="#c9a84c" />
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f8', margin: 0 }}>Metas da Equipe</h1>
          </div>
          <p style={{ fontSize: 13, color: '#9090a8', margin: 0 }}>Defina e acompanhe as metas individuais de cada colaboradora</p>
        </div>
        {colaboradoras.length > 0 && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{ background: savedOk ? 'rgba(0,200,150,0.15)' : 'linear-gradient(135deg,#c9a84c,#a8852e)', border: savedOk ? '1px solid #00c896' : 'none', borderRadius: 10, padding: '10px 18px', fontSize: 12, fontWeight: 600, color: savedOk ? '#00c896' : '#0a0a0f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Sora, sans-serif' }}
          >
            <Save size={14} /> {isSaving ? 'Salvando...' : savedOk ? 'Salvo!' : 'Salvar Metas'}
          </button>
        )}
      </div>

      {/* Resumo total */}
      {colaboradoras.length > 0 && (
        <div style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#606078', marginBottom: 4 }}>Meta Total da Equipe</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#c9a84c' }}>
              R$ {totalMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#c9a84c', fontWeight: 600 }}>
            {colaboradoras.length} colaboradora{colaboradoras.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Lista */}
      {colaboradoras.length === 0 ? (
        <div style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 15, color: '#f0f0f8', marginBottom: 6 }}>Nenhuma colaboradora cadastrada</div>
          <div style={{ fontSize: 12, color: '#606078' }}>
            Adicione colaboradoras em <strong style={{ color: '#9090a8' }}>Parâmetros do Negócio → Equipe</strong>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {colaboradoras.map((col) => (
            <div key={col.id} style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                {/* Avatar + Nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.1))', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#c9a84c', fontWeight: 600 }}>
                    {col.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f8' }}>{col.nome}</div>
                    <div style={{ fontSize: 11, color: '#606078', marginTop: 2 }}>Colaboradora</div>
                  </div>
                </div>

                {/* Input de meta */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#606078', marginBottom: 6 }}>Meta Mensal (R$)</div>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={col.meta || ''}
                    onChange={e => handleMetaChange(col.id, parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    style={{ background: '#1c1c26', border: '1px solid #2a2a38', borderRadius: 8, padding: '8px 12px', color: '#c9a84c', fontSize: 16, fontWeight: 600, outline: 'none', fontFamily: 'Sora, sans-serif', textAlign: 'right', width: 160 }}
                  />
                </div>
              </div>

              {/* Progresso */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#606078', marginBottom: 6 }}>
                  <span>Faturamento do mês</span>
                  <span>Acompanhamento disponível em breve</span>
                </div>
                <div style={{ height: 5, background: '#1c1c26', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg, #c9a84c, #e8c96a)', borderRadius: 99 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: '#9090a8' }}>R$ 0,00</span>
                  <span style={{ color: '#606078' }}>0%</span>
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
