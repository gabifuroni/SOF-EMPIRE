import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Service, Material } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import FinancialSummary from './FinancialSummary';

// Import BusinessParams type from the context
interface BusinessParams {
  lucroDesejado: number;
  despesasIndiretasDepreciacao: number;
  despesasDiretas: number;
  impostosRate: number;
  weightedAverageRate: number;
  workingDaysPerYear: number;
  attendanceGoal: number;
  monthlyGoal: number;
  goalType: 'financial' | 'attendance';
  paymentMethods: Array<{
    id: string;
    name: string;
    isActive: boolean;
    distributionPercentage: number;
    taxRate: number;
  }>;
  depreciacaoValorMobilizado: number;
  depreciacaoTotalMesDepreciado: number;
  depreciacaoMensal: number;
  equipeNumeroProfissionais: number;
  trabalhaSegunda: boolean;
  trabalhaTerca: boolean;
  trabalhaQuarta: boolean;
  trabalhaQuinta: boolean;
  trabalhaSexta: boolean;
  trabalhaSabado: boolean;
  trabalhaDomingo: boolean;
  feriados: Array<{id: string, date: string, name: string}>;
}

interface ServiceAnalysisModalProps {
  service: Service | null;
  materials: Material[];
  businessParams: BusinessParams;
  show: boolean;
  onClose: () => void;
}

const ServiceAnalysisModal = ({ service, materials, businessParams, show, onClose }: ServiceAnalysisModalProps) => {
  if (!service) return null;

  const materialTotal = service.materialCosts?.reduce((sum, mc) => sum + mc.cost, 0) || 0;
  const cardTaxCost = (service.salePrice * businessParams.weightedAverageRate) / 100;
  const serviceTaxCost = (service.salePrice * businessParams.impostosRate) / 100;
  const commissionCost = (service.salePrice * service.commissionRate) / 100;

  // Calculate values using same logic as ServiceTable
  const totalDirectCosts = service.totalCost;
  const totalDirectCostsPercentage = service.salePrice > 0 ? (totalDirectCosts / service.salePrice) * 100 : 0;
  const operationalMargin = service.salePrice - totalDirectCosts;
  const operationalMarginPercentage = service.salePrice > 0 ? (operationalMargin / service.salePrice) * 100 : 0;
  
  // Calculate operational cost using business params (same as ServiceTable)
  const operationalCost = (service.salePrice * businessParams.despesasIndiretasDepreciacao) / 100;
  const operationalCostPercentage = businessParams.despesasIndiretasDepreciacao;
  
  // Calculate partial profit (same as ServiceTable)
  const partialProfit = operationalMargin - operationalCost;
  const partialProfitPercentage = service.salePrice > 0 ? (partialProfit / service.salePrice) * 100 : 0;

  // Calculate material cost percentage
  const materialCostPercentage = service.salePrice > 0 ? (materialTotal / service.salePrice) * 100 : 0;

  const chartData = [
    { name: 'Lucro Bruto', value: service.grossProfit, color: '#6366f1' }, // Indigo
    { name: 'Matéria-Prima', value: materialTotal, color: '#ef4444' }, // Red
    { name: 'Taxa de Cartão', value: cardTaxCost, color: '#f59e0b' }, // Amber
    { name: 'Impostos', value: serviceTaxCost, color: '#8b5cf6' }, // Purple
    { name: 'Comissão/Rateio', value: commissionCost, color: '#10b981' } // Emerald
  ].filter(item => item.value > 0);

  const getMaterialName = (materialId: string) => {
    return materials.find(m => m.id === materialId)?.name || 'Material não encontrado';
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="brand-heading text-2xl text-symbol-black">
            Análise de Precificação - {service.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visão Geral do Serviço */}
          <div className="symbol-card p-6 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
            <h3 className="brand-heading text-xl text-symbol-black mb-4">📋 Resumo Executivo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="text-center p-3 bg-white/60 rounded-lg border border-blue-200">
                <div className="text-sm mb-1">💰</div>
                <h4 className="brand-subheading text-symbol-black text-xs uppercase tracking-wide mb-1">Preço</h4>
                <p className="brand-heading text-sm text-blue-700">
                  R$ {service.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg border border-blue-200">
                <div className="text-sm mb-1">📉</div>
                <h4 className="brand-subheading text-symbol-black text-xs uppercase tracking-wide mb-1">Custo Total</h4>
                <p className="brand-heading text-sm text-red-600">
                  R$ {service.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg border border-blue-200">
                <div className="text-sm mb-1">📈</div>
                <h4 className="brand-subheading text-symbol-black text-xs uppercase tracking-wide mb-1">Margem Op.</h4>
                <p className={`brand-heading text-sm ${operationalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {operationalMargin.toFixed(2)}
                </p>
                <p className="text-xs text-symbol-gray-600">
                  {operationalMarginPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg border border-blue-200">
                <div className="text-sm mb-1">🏢</div>
                <h4 className="brand-subheading text-symbol-black text-xs uppercase tracking-wide mb-1">Custo Op.</h4>
                <p className="brand-heading text-sm text-orange-600">
                  R$ {operationalCost.toFixed(2)}
                </p>
                <p className="text-xs text-symbol-gray-600">
                  {operationalCostPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg border border-blue-200">
                <div className="text-sm mb-1">💎</div>
                <h4 className="brand-subheading text-symbol-black text-xs uppercase tracking-wide mb-1">Lucro Parcial</h4>
                <p className={`brand-heading text-sm ${partialProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {partialProfit.toFixed(2)}
                </p>
                <p className="text-xs text-symbol-gray-600">
                  {partialProfitPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg border border-blue-200">
                <div className="text-sm mb-1">📊</div>
                <h4 className="brand-subheading text-symbol-black text-xs uppercase tracking-wide mb-1">Lucro Bruto</h4>
                <p className={`brand-heading text-sm ${service.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {service.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-symbol-gray-600">
                  {service.profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico de Composição e Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="symbol-card p-6 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
              <h3 className="brand-heading text-xl text-symbol-black mb-4">📊 Como seu dinheiro é distribuído</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      formatter={(value) => <span className="text-sm brand-body text-symbol-gray-700">{value}</span>}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-emerald-100/50 rounded-lg">
                <p className="text-sm text-emerald-700 text-center">
                  💡 <strong>Cada fatia representa onde vai cada real do seu preço de venda</strong>
                </p>
              </div>
            </div>

            {/* Breakdown Simplificado dos Custos */}
            <div className="symbol-card p-6 shadow-lg bg-gradient-to-br from-orange-50/50 to-orange-100/30 border-orange-200/50">
              <h3 className="brand-heading text-xl text-symbol-black mb-4">🔍 Breakdown dos Custos</h3>
              <div className="space-y-3">
                {/* Matéria-Prima */}
                {materialTotal > 0 && (
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="brand-subheading text-symbol-black">Matéria-Prima</span>
                    </div>
                    <div className="text-right">
                      <span className="brand-heading text-red-600">R$ {materialTotal.toFixed(2)}</span>
                      <div className="text-xs text-symbol-gray-600">{materialCostPercentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )}

                {/* Taxa de Cartão */}
                {cardTaxCost > 0 && (
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-500 rounded"></div>
                      <span className="brand-subheading text-symbol-black">Taxa Cartão ({businessParams.weightedAverageRate.toFixed(1)}%)</span>
                    </div>
                    <span className="brand-heading text-amber-600">R$ {cardTaxCost.toFixed(2)}</span>
                  </div>
                )}

                {/* Impostos */}
                {serviceTaxCost > 0 && (
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="brand-subheading text-symbol-black">Impostos ({businessParams.impostosRate.toFixed(1)}%)</span>
                    </div>
                    <span className="brand-heading text-purple-600">R$ {serviceTaxCost.toFixed(2)}</span>
                  </div>
                )}

                {/* Comissão */}
                {commissionCost > 0 && (
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                      <span className="brand-subheading text-symbol-black">Comissão ({service.commissionRate}%)</span>
                    </div>
                    <span className="brand-heading text-emerald-600">R$ {commissionCost.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
                  <span className="brand-heading text-gray-800">Total dos Custos</span>
                  <span className="brand-heading text-gray-800">R$ {totalDirectCosts.toFixed(2)}</span>
                </div>

                {/* Margem Operacional */}
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-300">
                  <span className="brand-heading text-green-800">Margem Operacional</span>
                  <div className="text-right">
                    <span className="brand-heading text-green-800">R$ {operationalMargin.toFixed(2)}</span>
                    <div className="text-sm text-green-600">{operationalMarginPercentage.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Custo Operacional */}
                <div className="flex justify-between items-center p-3 bg-orange-100 rounded-lg border-2 border-orange-300">
                  <span className="brand-heading text-orange-800">Custo Operacional</span>
                  <div className="text-right">
                    <span className="brand-heading text-orange-800">R$ {operationalCost.toFixed(2)}</span>
                    <div className="text-sm text-orange-600">{operationalCostPercentage.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Lucro Parcial */}
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-symbol-gold/20 to-symbol-beige/30 rounded-lg border-2 border-symbol-gold/50">
                  <span className="brand-heading text-symbol-black">💎 Lucro Parcial</span>
                  <div className="text-right">
                    <span className={`brand-heading text-lg ${partialProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      R$ {partialProfit.toFixed(2)}
                    </span>
                    <div className={`text-sm ${partialProfitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {partialProfitPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhamento da Matéria-Prima - Apenas se houver materiais */}
          {service.materialCosts && service.materialCosts.length > 0 && (
            <div className="symbol-card p-6 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
              <h3 className="brand-heading text-xl text-symbol-black mb-4">🧱 Materiais Utilizados</h3>
              <div className="space-y-2">
                {service.materialCosts.map((mc, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="brand-body text-symbol-black font-medium">
                        {getMaterialName(mc.materialId)}
                      </span>
                      <span className="text-sm text-symbol-gray-600">
                        (Qtd: {mc.quantity})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="brand-heading text-purple-700">
                        R$ {mc.cost.toFixed(2)}
                      </span>
                      <div className="text-xs text-purple-600">
                        {materialTotal > 0 ? ((mc.cost / materialTotal) * 100).toFixed(1) : 0}% do total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análise Rápida e Recomendações */}
          <div className="symbol-card p-6 shadow-lg bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 border-yellow-200/50">
            <h3 className="brand-heading text-xl text-symbol-black mb-4">💡 Análise Rápida</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status da Margem - baseado no Lucro Parcial */}
              <div>
                {partialProfitPercentage >= 20 && (
                  <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-green-600">✅</div>
                      <span className="font-semibold text-green-800">Excelente Lucratividade!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Lucro parcial de {partialProfitPercentage.toFixed(1)}% - Serviço altamente rentável!
                    </p>
                  </div>
                )}
                
                {partialProfitPercentage >= 10 && partialProfitPercentage < 20 && (
                  <div className="p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-yellow-600">⚠️</div>
                      <span className="font-semibold text-yellow-800">Lucratividade Moderada</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Lucro parcial de {partialProfitPercentage.toFixed(1)}% - Há espaço para melhorias.
                    </p>
                  </div>
                )}
                
                {partialProfitPercentage < 10 && partialProfitPercentage >= 0 && (
                  <div className="p-4 bg-red-100 rounded-lg border border-red-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-red-600">🚨</div>
                      <span className="font-semibold text-red-800">Lucratividade Baixa</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Lucro parcial de {partialProfitPercentage.toFixed(1)}% - Considere revisar custos ou preço.
                    </p>
                  </div>
                )}
                
                {partialProfitPercentage < 0 && (
                  <div className="p-4 bg-red-200 rounded-lg border border-red-400">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-red-700">🔴</div>
                      <span className="font-semibold text-red-800">Prejuízo Operacional!</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Prejuízo de {Math.abs(partialProfitPercentage).toFixed(1)}% - Revise urgentemente!
                    </p>
                  </div>
                )}

                {/* Informação adicional sobre o cálculo */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-blue-600">ℹ️</div>
                    <span className="font-semibold text-blue-800 text-sm">Como calculamos</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Lucro Parcial = Margem Operacional - Custo Operacional (despesas indiretas)
                  </p>
                </div>
              </div>

              {/* Dicas Rápidas */}
              <div className="space-y-3">
                {materialCostPercentage > 40 && (
                  <div className="p-3 bg-blue-100 rounded-lg border border-blue-300">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-blue-600">💡</div>
                      <span className="font-semibold text-blue-800 text-sm">Material Alto</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {materialCostPercentage.toFixed(1)}% do preço é material. Considere fornecedores alternativos.
                    </p>
                  </div>
                )}
                
                {businessParams.weightedAverageRate > 4 && (
                  <div className="p-3 bg-blue-100 rounded-lg border border-blue-300">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-blue-600">💳</div>
                      <span className="font-semibold text-blue-800 text-sm">Taxa Cartão Alta</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {businessParams.weightedAverageRate.toFixed(1)}% é alta. Negocie com a operadora.
                    </p>
                  </div>
                )}
                
                <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-green-600">📈</div>
                    <span className="font-semibold text-green-800 text-sm">Próximos Passos</span>
                  </div>
                  <p className="text-xs text-green-700">
                    Monitore estes números regularmente e ajuste conforme necessário.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={onClose} 
              variant="outline"
              className="border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50"
            >
              Fechar Análise
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceAnalysisModal;
