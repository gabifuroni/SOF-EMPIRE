import { usePatentes } from '@/hooks/usePatentes';
import { useProfile } from '@/hooks/useProfile';
import { useTransactions } from '@/hooks/useTransactions';

interface PatenteCardProps {
  currentRevenue: number;
}

const PatenteCard = ({ currentRevenue }: PatenteCardProps) => {
  const { patentes, isLoading: patentesLoading } = usePatentes();
  const { profile, isLoading: profileLoading } = useProfile();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  if (patentesLoading || profileLoading || transactionsLoading) {
    return (
      <div style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 12, padding: '24px 28px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1c1c26' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 16, background: '#1c1c26', borderRadius: 4, marginBottom: 8, width: '40%' }} />
            <div style={{ height: 12, background: '#1c1c26', borderRadius: 4, width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = transactions
    .filter(t => t.tipo_transacao === 'ENTRADA')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const sortedPatentes = [...patentes].sort((a, b) => a.faturamento_minimo_necessario - b.faturamento_minimo_necessario);

  const currentPatente = sortedPatentes
    .filter(p => totalRevenue >= p.faturamento_minimo_necessario)
    .pop() || sortedPatentes[0];

  const nextPatente = sortedPatentes.find(p => p.faturamento_minimo_necessario > totalRevenue);

  const progressToNext = nextPatente
    ? ((totalRevenue - (currentPatente?.faturamento_minimo_necessario || 0)) /
       (nextPatente.faturamento_minimo_necessario - (currentPatente?.faturamento_minimo_necessario || 0))) * 100
    : 100;

  const remainingToNext = nextPatente ? nextPatente.faturamento_minimo_necessario - totalRevenue : 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #16141f 0%, #13131a 60%, #1a1520 100%)',
      border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: 12,
      padding: '24px 28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160,
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>
            {currentPatente?.icon || '🌱'}
          </div>
          <div>
            <div style={{ fontFamily: 'serif', fontSize: 18, fontWeight: 600, color: '#f0f0f8', marginBottom: 3 }}>
              {currentPatente?.nome_patente || 'Iniciante'}
            </div>
            <div style={{ fontSize: 12, color: '#9090a8' }}>Sua patente atual</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 600, color: '#c9a84c' }}>
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11, color: '#9090a8', marginTop: 2 }}>Faturamento total</div>
        </div>
      </div>

      {nextPatente && (
        <div>
          {/* Next patente label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{nextPatente.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9090a8' }}>
                Próxima: {nextPatente.nome_patente}
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#c9a84c', fontWeight: 500 }}>
              {progressToNext.toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 8, background: '#1c1c26', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{
              height: '100%',
              width: `${Math.min(progressToNext, 100)}%`,
              background: 'linear-gradient(90deg, #c9a84c, #e8c96a)',
              borderRadius: 99,
              transition: 'width 0.7s ease',
            }} />
          </div>

          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#606078', marginBottom: 10 }}>
            <span>Atual: R$ {totalRevenue.toLocaleString('pt-BR')}</span>
            <span>Próxima: R$ {nextPatente.faturamento_minimo_necessario.toLocaleString('pt-BR')}</span>
          </div>

          <div style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid #2a2a38' }}>
            <span style={{ fontSize: 12, color: '#9090a8' }}>
              Faltam <strong style={{ color: '#c9a84c' }}>R$ {remainingToNext.toLocaleString('pt-BR')}</strong> para a próxima patente
            </span>
          </div>
        </div>
      )}

      {!nextPatente && (
        <div style={{ textAlign: 'center', paddingTop: 12, borderTop: '1px solid #2a2a38' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>👑</div>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9a84c' }}>
            Parabéns! Você alcançou a patente máxima!
          </p>
        </div>
      )}
    </div>
  );
};

export default PatenteCard;
