interface SummaryCardProps {
  paymentMethods: Array<{ isActive: boolean }>;
  totalDistribution: number;
  weightedAverageRate: number;
  workingDaysPerYear: number;
  totalMargins: number;
}

export const SummaryCard = ({
  paymentMethods,
  totalDistribution,
  weightedAverageRate,
  workingDaysPerYear,
  totalMargins
}: SummaryCardProps) => {
  return (
    <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <h2 className="brand-heading text-xl text-symbol-black mb-2">
          Resumo dos Cálculos
        </h2>
        <div className="w-8 h-px bg-symbol-beige"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-8">
        <div className="text-center">
          <div className="brand-heading text-3xl text-symbol-black mb-2">
            {paymentMethods.filter(m => m.isActive).length}
          </div>
          <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
            Formas Ativas
          </div>
        </div>
        
        <div className="text-center">
          <div className={`brand-heading text-3xl mb-2 ${
            Math.abs(totalDistribution - 100) > 0.01 
              ? 'text-red-600' 
              : 'text-symbol-black'
          }`}>
            {totalDistribution.toFixed(1)}%
          </div>
          <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
            Total Distribuição
          </div>
        </div>
        
        <div className="text-center">
          <div className="brand-heading text-3xl text-symbol-gold mb-2">
            {weightedAverageRate.toFixed(2)}%
          </div>
          <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
            Taxa Média Ponderada
          </div>
        </div>
        
        <div className="text-center">
          <div className="brand-heading text-3xl text-symbol-black mb-2">
            {workingDaysPerYear}
          </div>
          <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
            Dias Trabalhados/Ano
          </div>
        </div>
        
        <div className="text-center">
          <div className={`brand-heading text-3xl mb-2 ${
            Math.abs(totalMargins - 100) > 0.01 
              ? 'text-red-600' 
              : 'text-symbol-black'
          }`}>
            {totalMargins.toFixed(1)}%
          </div>
          <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
            Total Margens
          </div>
        </div>
      </div>
      
      {(Math.abs(totalDistribution - 100) > 0.01 || Math.abs(totalMargins - 100) > 0.01) && (        <div className="mt-6 p-4 bg-red-50 border border-red-200">
          <p className="text-red-700 brand-body text-sm">
            ⚠️ {Math.abs(totalDistribution - 100) > 0.01 && `A soma dos percentuais de distribuição é ${totalDistribution.toFixed(2)}% (recomendado: 100%).`}
            {Math.abs(totalDistribution - 100) > 0.01 && Math.abs(totalMargins - 100) > 0.01 && " "}
            {Math.abs(totalMargins - 100) > 0.01 && "A soma das margens deve ser igual a 100%."}
            {Math.abs(totalMargins - 100) > 0.01 ? " Ajuste as margens antes de salvar." : " Você pode continuar se os valores estão corretos."}
          </p>
        </div>
      )}
    </div>
  );
};
