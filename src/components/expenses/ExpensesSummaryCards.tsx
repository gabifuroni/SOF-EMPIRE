
import { Receipt, DollarSign, Calculator, TrendingUp } from 'lucide-react';

interface ExpensesSummaryCardsProps {
  totalCategories: number;
  monthTotal: number;
  fixedExpensesTotal: number;
  variableExpenses: number;
}

const ExpensesSummaryCards = ({ 
  totalCategories, 
  monthTotal, 
  fixedExpensesTotal, 
  variableExpenses 
}: ExpensesSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
        <div className="flex items-center justify-between mb-4">
          <Receipt className="text-blue-600" size={20} />
        </div>
        <div className="mb-2">
          <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
            Total de Categorias
          </h3>
        </div>
        <div className="brand-heading text-2xl text-symbol-black">
          {totalCategories}
        </div>
      </div>

      <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/50">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="text-red-600" size={20} />
        </div>
        <div className="mb-2">
          <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
            Total do Mês
          </h3>
        </div>
        <div className="brand-heading text-2xl text-symbol-black">
          R$ {monthTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
        <div className="flex items-center justify-between mb-4">
          <Calculator className="text-emerald-600" size={20} />
        </div>
        <div className="mb-2">
          <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
            Despesas Fixas
          </h3>
        </div>
        <div className="brand-heading text-2xl text-symbol-black">
          R$ {fixedExpensesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="symbol-card p-6 hover:shadow-xl transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="text-purple-600" size={20} />
        </div>
        <div className="mb-2">
          <h3 className="brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wider">
            Despesas Variáveis
          </h3>
        </div>
        <div className="brand-heading text-2xl text-symbol-black">
          R$ {variableExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default ExpensesSummaryCards;
