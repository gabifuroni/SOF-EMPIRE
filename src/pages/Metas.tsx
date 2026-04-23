import { useBusinessParams } from '@/hooks/useBusinessParams';
import { Target } from 'lucide-react';

const Metas = () => {
  const { params } = useBusinessParams();
  const colaboradoras = params.equipeNomesProfissionais as unknown as Array<{id: string; nome: string; meta: number}>;

  const totalMeta = colaboradoras.reduce((sum, c) => sum + (c.meta || 0), 0);

  return (
    <div style={{ padding: '32px 24px', fontFamily: 'Sora, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Target size={20} color="#c9a84c" />
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f8', margin: 0 }}>Metas da Equipe</h1>
        </div>
        <p style={{ fontSize: 13, color: '#9090a8', margin: 0 }}>Acompanhe as metas individuais de cada colaboradora</p>
      </div>

      {/* Resumo */}
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

      {/* Lista de colaboradoras */}
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
          {colaboradoras.map((colaboradora) => (
            <div
              key={colaboradora.id}
              style={{ background: '#13131a', border: '1px solid #1e1e2a', borderRadius: 12, padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                {/* Avatar + Nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.1))', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#c9a84c', fontWeight: 600 }}>
                    {colaboradora.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f8' }}>{colaboradora.nome}</div>
                    <div style={{ fontSize: 11, color: '#606078', marginTop: 2 }}>Colaboradora</div>
                  </div>
                </div>

                {/* Meta */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#606078', marginBottom: 2 }}>Meta Mensal</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#c9a84c' }}>
                    {colaboradora.meta > 0
                      ? `R$ ${colaboradora.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : <span style={{ color: '#606078', fontSize: 13 }}>Sem meta definida</span>
                    }
                  </div>
                </div>
              </div>

              {/* Progresso */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9090a8', marginBottom: 6 }}>
                  <span>Faturamento do mês</span>
                  <span style={{ color: '#606078' }}>Acompanhamento disponível em breve</span>
                </div>
                <div style={{ height: 5, background: '#1c1c26', borderRadius: 99, overflow: 'hidden' }}>
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
