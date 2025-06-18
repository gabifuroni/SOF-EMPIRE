
interface FinancialSummaryProps {
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  operationalCost?: number;
  operationalProfit?: number;
  operationalMargin?: number;
  commissionCost?: number;
}

const FinancialSummary = ({ 
  totalCost, 
  grossProfit, 
  profitMargin, 
  operationalCost, 
  operationalProfit, 
  operationalMargin,
  commissionCost
}: FinancialSummaryProps) => {
  return (
    <div className="bg-elite-pearl-100 p-4 rounded-lg border border-elite-pearl-200">
      <h3 className="font-semibold text-elite-charcoal-800 mb-3">Resumo Financeiro</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-elite-charcoal-600">Custo Total:</span>
          <p className="font-semibold text-elite-charcoal-900">R$ {totalCost.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-elite-charcoal-600">Lucro Bruto:</span>
          <p className="font-semibold text-elite-rose-700">R$ {grossProfit.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-elite-charcoal-600">Margem Bruta:</span>
          <p className="font-semibold text-elite-rose-700">{profitMargin.toFixed(1)}%</p>
        </div>
        {commissionCost !== undefined && (
          <div>
            <span className="text-elite-charcoal-600">Comissão/Rateio:</span>
            <p className="font-semibold text-orange-600">R$ {commissionCost.toFixed(2)}</p>
          </div>
        )}
        {operationalCost !== undefined && (
          <div>
            <span className="text-elite-charcoal-600">Custo Operacional:</span>
            <p className="font-semibold text-blue-600">R$ {operationalCost.toFixed(2)}</p>
          </div>
        )}
        {operationalMargin !== undefined && (
          <div>
            <span className="text-elite-charcoal-600">Margem Operacional:</span>
            <p className="font-semibold text-green-600">{operationalMargin.toFixed(1)}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSummary;
