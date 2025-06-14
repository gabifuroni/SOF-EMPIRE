
interface FinancialSummaryProps {
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}

const FinancialSummary = ({ totalCost, grossProfit, profitMargin }: FinancialSummaryProps) => {
  return (
    <div className="bg-elite-pearl-100 p-4 rounded-lg border border-elite-pearl-200">
      <h3 className="font-semibold text-elite-charcoal-800 mb-3">Resumo Financeiro</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-elite-charcoal-600">Custo Total:</span>
          <p className="font-semibold text-elite-charcoal-900">R$ {totalCost.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-elite-charcoal-600">Lucro Bruto:</span>
          <p className="font-semibold text-elite-rose-700">R$ {grossProfit.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-elite-charcoal-600">Margem:</span>
          <p className="font-semibold text-elite-rose-700">{profitMargin.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
