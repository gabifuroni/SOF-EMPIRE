
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface DailyCashFlowMetricsProps {
  totalEntradas: number;
  totalSaidas: number;
  saldoDia: number;
  dailyGoal?: number;
  currentProgress?: number;
  remainingToGoal?: number;
  goalLabel?: string;
  goalUnit?: string;
}

const DailyCashFlowMetrics = ({ 
  totalEntradas, 
  totalSaidas, 
  saldoDia, 
  dailyGoal, 
  currentProgress, 
  remainingToGoal,
  goalLabel,
  goalUnit
}: DailyCashFlowMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="text-emerald-600" size={20} />
        </div>
        <div className="mb-2">
          <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
            Entradas do Dia
          </h3>
        </div>
        <div className="brand-heading text-2xl text-symbol-black mb-1">
          R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      
      <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
        <div className="flex items-center justify-between mb-4">
          <TrendingDown className="text-red-600" size={20} />
        </div>
        <div className="mb-2">
          <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
            Saídas do Dia
          </h3>
        </div>
        <div className="brand-heading text-2xl text-symbol-black mb-1">
          R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      
      <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className={`${saldoDia >= 0 ? 'text-blue-600' : 'text-red-600'}`} size={20} />
        </div>
        <div className="mb-2">
          <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
            Saldo do Dia
          </h3>
        </div>        <div className={`brand-heading text-2xl mb-1 ${saldoDia >= 0 ? 'text-symbol-black' : 'text-red-600'}`}>
          R$ {saldoDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
        {/* Meta Dinâmica - mostra se os dados foram fornecidos */}
      {dailyGoal !== undefined && currentProgress !== undefined && remainingToGoal !== undefined && goalLabel && (
        <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
          <div className="flex items-center justify-between mb-4">
            <Target className="text-purple-600" size={20} />
          </div>
          <div className="mb-2">
            <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
              {goalLabel}
            </h3>
          </div>
          <div className="brand-heading text-2xl text-symbol-black mb-1">
            {goalUnit === 'R$' 
              ? `R$ ${currentProgress.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ ${dailyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : `${currentProgress} / ${dailyGoal}`
            }
          </div>
          <div className="text-sm text-symbol-gray-600">
            {remainingToGoal > 0 
              ? `Faltam ${goalUnit === 'R$' 
                  ? `R$ ${remainingToGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                  : remainingToGoal
                }`
              : 'Meta atingida! 🎉'
            }
          </div>
          <div className="mt-2 bg-purple-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentProgress / dailyGoal) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCashFlowMetrics;
