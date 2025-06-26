import React from 'react';
import { MonthlyReportData } from './types/ReportTypes';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface Transaction {
  date: string;
  tipo_transacao: 'ENTRADA' | 'SAIDA';
  valor: number;
  category?: string | null;
  commission?: number | null;
}

interface DetailedMetricsProps {
  reportData: MonthlyReportData;
  formatCurrency: (value: number) => string;
  selectedMonth: number;
  selectedYear: number;
  transactions: Transaction[];
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DetailedMetrics = ({ reportData, formatCurrency, selectedMonth, selectedYear, transactions }: DetailedMetricsProps) => {
  const formatPercentage = (value: number | undefined | null) => `${Number(value ?? 0).toFixed(1)}%`;

  // Filter transactions for the selected month
  const targetDate = new Date(selectedYear, selectedMonth, 1);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);
  
  const monthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  // Group expenses by category
  const expensesByCategory = monthTransactions
    .filter(t => t.tipo_transacao === 'SAIDA')
    .reduce((acc, transaction) => {
      const category = transaction.category || 'Outros';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(transaction.valor);
      return acc;
    }, {} as Record<string, number>);
  // Calculate percentage for each category
  const expensesWithPercentage = Object.entries(expensesByCategory)
    .map(([category, value]) => ({
      category,
      value,
      percentage: reportData.faturamento > 0 ? (value / reportData.faturamento) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  // Separate direct costs from operational costs
  const directCostCategories = ['FORNECEDORES'];
  const operationalCostCategories = expensesWithPercentage.filter(
    item => !directCostCategories.includes(item.category)
  );

  return (
    <div className="symbol-card p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <h3 className="brand-heading text-xl text-symbol-black mb-2">
          Análise Detalhada - {months[selectedMonth]} {selectedYear}
        </h3>
        <p className="text-symbol-gray-600">
          Breakdown completo dos custos e margens (baseado na tabela de serviços)
        </p>
        <div className="w-8 h-px bg-symbol-beige mt-2"></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-symbol-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-symbol-gray-700">Componente</th>
              <th className="text-right py-3 px-2 font-semibold text-symbol-gray-700">Valor (R$)</th>
              <th className="text-right py-3 px-2 font-semibold text-symbol-gray-700">Percentual (%)</th>
            </tr>
          </thead>
          <tbody className="space-y-2">
            {/* Faturamento */}
            <tr className="border-b border-symbol-gray-100">
              <td className="py-2 px-2 font-medium text-symbol-black">Preço (Faturamento)</td>
              <td className="py-2 px-2 text-right font-semibold text-blue-600">
                {formatCurrency(reportData.faturamento)}
              </td>
              <td className="py-2 px-2 text-right text-symbol-gray-600">100.0%</td>
            </tr>

            {/* Comissão */}
            <tr className="border-b border-symbol-gray-100">
              <td className="py-2 px-2 text-symbol-gray-700">Comissão</td>
              <td className="py-2 px-2 text-right text-purple-600">
                {formatCurrency(reportData.comissoes)}
              </td>
              <td className="py-2 px-2 text-right text-purple-600">
                {formatPercentage(reportData.percentualComissao)}
              </td>
            </tr>      
            {operationalCostCategories.length > 0 && (
              <>
                <tr className="border-b border-symbol-gray-200 bg-gray-50">
                  <td colSpan={3} className="py-2 px-2 font-medium text-symbol-gray-700 text-xs uppercase tracking-wide">
                    CUSTOS OPERACIONAIS (SAÍDAS DO FLUXO DE CAIXA)
                  </td>
                </tr>
                {operationalCostCategories.map((item, index) => (
                  <tr key={item.category} className="border-b border-symbol-gray-100">
                    <td className="py-2 px-2 text-symbol-gray-700 pl-4">• {item.category == 'Fornecedores' ? 'Mat. Prima (Fornecedores)' : item.category }</td>
                    <td className="py-2 px-2 text-right text-orange-600">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="py-2 px-2 text-right text-orange-600">
                      {formatPercentage(item.percentage)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Cartão */}
            <tr className="border-b border-symbol-gray-100">
              <td className="py-2 px-2 text-symbol-gray-700">Cartão</td>
              <td className="py-2 px-2 text-right text-blue-600">
                {formatCurrency(reportData.taxasCartao)}
              </td>
              <td className="py-2 px-2 text-right text-blue-600">
                {formatPercentage(reportData.percentualCartao)}
              </td>
            </tr>

            {/* Imposto */}
            <tr className="border-b border-symbol-gray-100">
              <td className="py-2 px-2 text-symbol-gray-700">Imposto</td>
              <td className="py-2 px-2 text-right text-rose-600">
                {formatCurrency(reportData.impostos)}
              </td>
              <td className="py-2 px-2 text-right text-rose-600">
                {formatPercentage(reportData.percentualImpostos)}
              </td>
            </tr>            {/* Total de Custos Diretos - comissão + cartão + impostos + todas as saídas do fluxo de caixa */}
            <tr className="border-b-2 border-symbol-gray-300 bg-red-50">
              <td className="py-3 px-2 font-semibold text-symbol-black">Total Custos Diretos</td>
              <td className="py-3 px-2 text-right font-bold text-red-600">
                {formatCurrency(reportData.custosDirectos)}
              </td>
              <td className="py-3 px-2 text-right font-bold text-red-600">
                {formatPercentage(reportData.percentualCustosDirectos)}
              </td>
            </tr>

            {/* Margem Operacional */}
            <tr className="border-b border-symbol-gray-100 bg-green-50">
              <td className="py-3 px-2 font-semibold text-symbol-black">Margem Operacional</td>
              <td className="py-3 px-2 text-right font-bold text-green-600">
                {formatCurrency(reportData.lucroOperacional)}
              </td>
              <td className="py-3 px-2 text-right font-bold text-green-600">
                {formatPercentage(reportData.margemOperacional)}
              </td>
            </tr>

            {/* Custo Operacional */}
            <tr className="border-b border-symbol-gray-100">
              <td className="py-2 px-2 text-symbol-gray-700">Custo Operacional</td>
              <td className="py-2 px-2 text-right text-orange-600">
                {formatCurrency(reportData.custoOperacional)}
              </td>
              <td className="py-2 px-2 text-right text-orange-600">
                {formatPercentage(reportData.percentualCustoOperacional)}
              </td>
            </tr>            {/* Lucro Parcial (Final) */}
            <tr className="border-b-2 border-symbol-gold bg-yellow-50">
              <td className="py-3 px-2 font-bold text-symbol-black">Lucro Parcial (Final)</td>
              <td className="py-3 px-2 text-right font-bold text-symbol-gold">
                {formatCurrency(reportData.lucroLiquido)}
              </td>
              <td className="py-3 px-2 text-right font-bold text-symbol-gold">
                {formatPercentage(reportData.margemLucro)}
              </td>
            </tr>

            {/* Resumo de Custos Operacionais Reais */}
            {operationalCostCategories.length > 0 && (
              <>
                <tr className="border-b border-symbol-gray-200 bg-blue-50">
                  <td colSpan={3} className="py-3 px-2 font-medium text-symbol-black text-sm">
                    COMPARATIVO: CUSTOS OPERACIONAIS
                  </td>
                </tr>
                <tr className="border-b border-symbol-gray-100">
                  <td className="py-2 px-2 text-symbol-gray-700">Total Saídas Reais (Fluxo de Caixa)</td>
                  <td className="py-2 px-2 text-right text-blue-600">
                    {formatCurrency(operationalCostCategories.reduce((sum, item) => sum + item.value, 0))}
                  </td>
                  <td className="py-2 px-2 text-right text-blue-600">
                    {formatPercentage(operationalCostCategories.reduce((sum, item) => sum + item.percentage, 0))}
                  </td>
                </tr>
                <tr className="border-b border-symbol-gray-100">
                  <td className="py-2 px-2 text-symbol-gray-700">Custo Operacional Estimado</td>
                  <td className="py-2 px-2 text-right text-gray-600">
                    {formatCurrency(reportData.custoOperacional)}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-600">
                    {formatPercentage(reportData.percentualCustoOperacional)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>      <div className="mt-4 p-4 bg-symbol-beige/20 rounded-lg">
        <p className="text-xs text-symbol-gray-600">
          <strong>Nota:</strong> Esta análise segue exatamente a mesma metodologia da tabela de serviços, 
          mas aplicada aos dados reais do fluxo de caixa do período selecionado.
        </p>
        <p className="text-xs text-symbol-gray-600 mt-2">
          <strong>Total Custos Diretos:</strong> Soma de Comissão + Cartão + Impostos + TODAS as saídas do fluxo de caixa 
          (custos operacionais de todas as categorias).
        </p>
      </div>
    </div>
  );
};
