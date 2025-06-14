
import { usePatentes } from '@/hooks/usePatentes';
import { useProfile } from '@/hooks/useProfile';

interface PatenteCardProps {
  currentRevenue: number;
}

const PatenteCard = ({ currentRevenue }: PatenteCardProps) => {
  const { patentes, isLoading: patentesLoading } = usePatentes();
  const { profile, isLoading: profileLoading } = useProfile();

  if (patentesLoading || profileLoading) {
    return (
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="h-6 bg-symbol-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-symbol-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  // Use accumulated revenue from profile
  const totalRevenue = profile?.faturamento_total_acumulado || 0;
  
  // Find current patente
  const currentPatente = patentes.find(p => 
    totalRevenue >= p.faturamento_minimo_necessario
  ) || patentes[0];

  // Find next patente
  const nextPatente = patentes.find(p => 
    p.faturamento_minimo_necessario > totalRevenue
  );

  const progressToNext = nextPatente 
    ? ((totalRevenue - (currentPatente?.faturamento_minimo_necessario || 0)) / 
       (nextPatente.faturamento_minimo_necessario - (currentPatente?.faturamento_minimo_necessario || 0))) * 100
    : 100;

  const remainingToNext = nextPatente 
    ? nextPatente.faturamento_minimo_necessario - totalRevenue
    : 0;

  return (
    <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-symbol-gold/10 to-symbol-beige/20 border-symbol-gold/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">
            {currentPatente?.icon || '🌟'}
          </div>
          <div>
            <h3 className="brand-heading text-xl text-symbol-black">
              {currentPatente?.nome_patente || 'Beauty Starters'}
            </h3>
            <p className="brand-body text-symbol-gray-600 text-sm">
              Sua patente atual
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="brand-heading text-2xl text-symbol-black">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="brand-body text-symbol-gray-600 text-sm">
            Faturamento total
          </p>
        </div>
      </div>

      {nextPatente && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{nextPatente.icon}</span>
              <span className="brand-subheading text-symbol-black text-sm uppercase tracking-wider">
                Próxima: {nextPatente.nome_patente}
              </span>
            </div>
            <span className="brand-body text-symbol-gray-600 text-sm">
              {progressToNext.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-symbol-gray-200 h-3 overflow-hidden rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-symbol-gold to-symbol-beige transition-all duration-700 rounded-full"
              style={{ width: `${Math.min(progressToNext, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-symbol-gray-600">
              Atual: R$ {(currentPatente?.faturamento_minimo_necessario || 0).toLocaleString('pt-BR')}
            </span>
            <span className="text-symbol-gray-600">
              Próxima: R$ {nextPatente.faturamento_minimo_necessario.toLocaleString('pt-BR')}
            </span>
          </div>
          
          <div className="text-center pt-2">
            <span className="brand-body text-symbol-gray-600 text-sm">
              Faltam <strong className="text-symbol-black">
                R$ {remainingToNext.toLocaleString('pt-BR')}
              </strong> para a próxima patente
            </span>
          </div>
        </div>
      )}

      {!nextPatente && (
        <div className="text-center py-4">
          <div className="text-2xl mb-2">👑</div>
          <p className="brand-subheading text-symbol-black text-sm uppercase tracking-wider">
            Parabéns! Você alcançou a patente máxima!
          </p>
        </div>
      )}
    </div>
  );
};

export default PatenteCard;
