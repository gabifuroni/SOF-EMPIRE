import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Service, Material } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface ServiceAnalysisModalProps {
  service: Service | null;
  materials: Material[];
  show: boolean;
  onClose: () => void;
}

const ServiceAnalysisModal = ({ service, materials, show, onClose }: ServiceAnalysisModalProps) => {
  if (!service) return null;

  const materialTotal = service.materialCosts?.reduce((sum, mc) => sum + mc.cost, 0) || 0;
  const cardTaxCost = (service.salePrice * service.cardTaxRate) / 100;
  const serviceTaxCost = (service.salePrice * service.serviceTaxRate) / 100;
  const commissionCost = (service.salePrice * service.commissionRate) / 100;

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="symbol-card p-6 shadow-lg bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/50">
              <h3 className="brand-subheading text-symbol-black text-lg mb-4">Resumo Financeiro</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="brand-body text-symbol-gray-600">Preço de Venda:</span>
                  <span className="brand-heading text-symbol-black">
                    R$ {service.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="brand-body text-symbol-gray-600">Custo Total:</span>
                  <span className="font-medium text-red-600">
                    R$ {service.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="border-t border-blue-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="brand-subheading text-symbol-black">Lucro Bruto:</span>
                    <span className="brand-heading text-blue-600 text-lg">
                      R$ {service.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="brand-subheading text-symbol-black">Margem de Lucro:</span>
                    <span className="brand-heading text-blue-600 text-lg">
                      {service.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="symbol-card p-6 shadow-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
              <h3 className="brand-subheading text-symbol-black text-lg mb-4">Composição dos Custos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      formatter={(value) => <span className="text-sm brand-body text-symbol-gray-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="symbol-card p-6 shadow-lg bg-gradient-to-br from-purple-50/50 to-purple-100/30 border-purple-200/50">
            <h3 className="brand-subheading text-symbol-black text-lg mb-4">Detalhamento dos Custos</h3>
            <div className="space-y-4">
              {service.materialCosts && service.materialCosts.length > 0 && (
                <div>
                  <h4 className="font-medium text-elite-charcoal-800 mb-2">Matéria-Prima:</h4>
                  <div className="space-y-2 ml-4">
                    {service.materialCosts.map((mc, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-elite-charcoal-600">
                          {getMaterialName(mc.materialId)} (Qtd: {mc.quantity})
                        </span>
                        <span className="font-medium text-elite-charcoal-900">
                          R$ {mc.cost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm font-medium border-t border-elite-rose-200 pt-2">
                      <span className="text-elite-charcoal-700">Total Matéria-Prima:</span>
                      <span className="text-elite-charcoal-900">R$ {materialTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-elite-charcoal-600">Taxa de Cartão ({service.cardTaxRate}%):</span>
                  <span className="font-medium text-elite-charcoal-900">R$ {cardTaxCost.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-elite-charcoal-600">Impostos ({service.serviceTaxRate}%):</span>
                  <span className="font-medium text-elite-charcoal-900">R$ {serviceTaxCost.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-elite-charcoal-600">Comissão ({service.commissionRate}%):</span>
                  <span className="font-medium text-elite-charcoal-900">R$ {commissionCost.toFixed(2)}</span>
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
