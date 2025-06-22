
interface FinancialSummaryProps {
  salePrice: number;
  commissionRate: number;
  commissionCost: number;
  cardTaxRate: number;
  cardTaxCost: number;
  serviceTaxRate: number;
  serviceTaxCost: number;
  materialCost: number;
  materialCostPercentage: number;
  totalDirectCosts: number;
  totalDirectCostsPercentage: number;
  operationalMargin: number;
  operationalMarginPercentage: number;
  operationalCost: number;
  operationalCostPercentage: number;
  partialProfit: number;
  partialProfitPercentage: number;
}

const FinancialSummary = ({ 
  salePrice,
  commissionRate,
  commissionCost,
  cardTaxRate,
  cardTaxCost,
  serviceTaxRate,
  serviceTaxCost,
  materialCost,
  materialCostPercentage,
  totalDirectCosts,
  totalDirectCostsPercentage,
  operationalMargin,
  operationalMarginPercentage,
  operationalCost,
  operationalCostPercentage,
  partialProfit,
  partialProfitPercentage
}: FinancialSummaryProps) => {
  return (
    <div className="symbol-card p-6 shadow-lg">
      <h3 className="brand-heading text-xl text-symbol-black mb-4">Resumo Financeiro</h3>
      
      {/* Preço Base */}
      <div className="mb-6 p-4 bg-symbol-beige/20 rounded-lg">
        <h4 className="brand-subheading text-symbol-black text-sm uppercase tracking-wider mb-3">
          💰 Preço do Serviço
        </h4>
        <div className="text-center">
          <span className="brand-heading text-2xl text-symbol-black">
            R$ {salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Custos Diretos */}
      <div className="mb-6">
        <h4 className="brand-subheading text-symbol-black text-sm uppercase tracking-wider mb-3">
          📊 Custos Diretos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <span className="text-sm text-orange-700">Comissão/Rateio:</span>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-orange-800">R$ {commissionCost.toFixed(2)}</span>
              <span className="text-sm text-orange-600">{commissionRate.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-700">Taxa Cartão:</span>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-800">R$ {cardTaxCost.toFixed(2)}</span>
              <span className="text-sm text-blue-600">{cardTaxRate.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <span className="text-sm text-purple-700">Impostos:</span>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-purple-800">R$ {serviceTaxCost.toFixed(2)}</span>
              <span className="text-sm text-purple-600">{serviceTaxRate.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-sm text-emerald-700">Matéria-Prima:</span>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-emerald-800">R$ {materialCost.toFixed(2)}</span>
              <span className="text-sm text-emerald-600">{materialCostPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        {/* Total dos Custos Diretos */}
        <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex justify-between items-center">
            <span className="brand-subheading text-red-800">Total Custos Diretos:</span>
            <div className="text-right">
              <span className="brand-heading text-lg text-red-800">
                R$ {totalDirectCosts.toFixed(2)}
              </span>
              <span className="block text-sm text-red-600">
                {totalDirectCostsPercentage.toFixed(1)}% do preço
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Margem */}
      <div className="mb-6">
        <h4 className="brand-subheading text-symbol-black text-sm uppercase tracking-wider mb-3">
          📈 Análise de Margem
        </h4>
        
        <div className="space-y-3">
          {/* Margem Operacional */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="brand-subheading text-green-800">Margem Operacional:</span>
                <p className="text-sm text-green-600">Valor - Custos Diretos</p>
              </div>
              <div className="text-right">
                <span className="brand-heading text-lg text-green-800">
                  R$ {operationalMargin.toFixed(2)}
                </span>
                <span className="block text-sm text-green-600">
                  {operationalMarginPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Custo Operacional */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="brand-subheading text-blue-800">Custo Operacional:</span>
                <p className="text-sm text-blue-600">Despesas Indiretas</p>
              </div>
              <div className="text-right">
                <span className="brand-heading text-lg text-blue-800">
                  R$ {operationalCost.toFixed(2)}
                </span>
                <span className="block text-sm text-blue-600">
                  {operationalCostPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lucro Final */}
      <div className="p-4 bg-gradient-to-r from-symbol-gold/20 to-symbol-beige/20 rounded-lg border-2 border-symbol-gold/40">
        <div className="flex justify-between items-center">
          <div>
            <span className="brand-heading text-symbol-black text-lg">💎 Lucro Parcial:</span>
            <p className="text-sm text-symbol-gray-600">Margem Op. - Custo Op.</p>
          </div>
          <div className="text-right">
            <span className={`brand-heading text-2xl ${partialProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              R$ {partialProfit.toFixed(2)}
            </span>
            <span className={`block text-lg ${partialProfitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {partialProfitPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {partialProfitPercentage < 0 && (
          <div className="mt-3 p-2 bg-red-100 rounded border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ Atenção: Este serviço está operando com prejuízo!
            </p>
          </div>
        )}
        
        {partialProfitPercentage >= 0 && partialProfitPercentage < 10 && (
          <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ Margem baixa: Considere revisar os custos ou preço.
            </p>
          </div>
        )}
        
        {partialProfitPercentage >= 10 && (
          <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
            <p className="text-sm text-green-700">
              ✅ Boa margem de lucro para este serviço!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSummary;
