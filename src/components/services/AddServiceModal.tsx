import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Service, Material, MaterialCost } from '@/types';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import ServiceFormFields from './ServiceFormFields';
import MaterialCostSection from './MaterialCostSection';
import TaxRatesSection from './TaxRatesSection';
import FinancialSummary from './FinancialSummary';

interface AddServiceModalProps {
  show: boolean;
  service?: Service | null;
  materials: Material[];
  onClose: () => void;
  onSave: (service: Omit<Service, 'id'>) => void;
}

const AddServiceModal = ({ show, service, materials, onClose, onSave }: AddServiceModalProps) => {
  const { params } = useBusinessParams();
  const [formData, setFormData] = useState({ name: '', salePrice: 0, commissionRate: 25.0 });
  const [materialCosts, setMaterialCosts] = useState<MaterialCost[]>([]);

  useEffect(() => {
    if (service) {
      setFormData({ name: service.name, salePrice: service.salePrice, commissionRate: service.commissionRate });
      setMaterialCosts(service.materialCosts || []);
    } else {
      setFormData({ name: '', salePrice: 0, commissionRate: 25.0 });
      setMaterialCosts([]);
    }
  }, [service, show]);

  const calculateCosts = () => {
    const materialTotal = materialCosts.reduce((sum, mc) => sum + mc.cost, 0);
    const cardTaxCost = (formData.salePrice * params.weightedAverageRate) / 100;
    const serviceTaxCost = (formData.salePrice * params.impostosRate) / 100;
    const commissionCost = (formData.salePrice * formData.commissionRate) / 100;
    const materialCostPercentage = formData.salePrice > 0 ? (materialTotal / formData.salePrice) * 100 : 0;
    const totalDirectCosts = commissionCost + cardTaxCost + serviceTaxCost + materialTotal;
    const totalDirectCostsPercentage = formData.salePrice > 0 ? (totalDirectCosts / formData.salePrice) * 100 : 0;
    const operationalMargin = formData.salePrice - totalDirectCosts;
    const operationalMarginPercentage = formData.salePrice > 0 ? (operationalMargin / formData.salePrice) * 100 : 0;
    const operationalCost = (formData.salePrice * params.despesasIndiretasDepreciacao) / 100;
    const partialProfit = operationalMargin - operationalCost;
    const partialProfitPercentage = formData.salePrice > 0 ? (partialProfit / formData.salePrice) * 100 : 0;
    const grossProfit = formData.salePrice - totalDirectCosts;
    const profitMargin = formData.salePrice > 0 ? (grossProfit / formData.salePrice) * 100 : 0;
    const totalCost = totalDirectCosts + operationalCost;
    const operationalProfit = formData.salePrice - totalCost;
    return { totalCost, grossProfit, profitMargin, operationalCost, operationalProfit, cardTaxCost, serviceTaxCost, commissionCost, materialTotal, materialCostPercentage, totalDirectCosts, totalDirectCostsPercentage, operationalMargin, operationalMarginPercentage, partialProfit, partialProfitPercentage };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const costs = calculateCosts();
    onSave({
      name: formData.name,
      salePrice: formData.salePrice,
      commissionRate: formData.commissionRate,
      cardTaxRate: params.weightedAverageRate,
      serviceTaxRate: params.impostosRate,
      materialCosts,
      totalCost: costs.totalCost,
      grossProfit: costs.grossProfit,
      profitMargin: costs.profitMargin,
    });
  };

  const costs = calculateCosts();

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ background: '#13131a', border: '1px solid #2a2a38', borderRadius: 16, color: '#f0f0f8' }}>
        <style>{`
          /* Dark modal overrides */
          .svc-modal-wrap { color: #f0f0f8; }
          .svc-modal-wrap label, .svc-modal-wrap h3, .svc-modal-wrap h4, .svc-modal-wrap p, .svc-modal-wrap span { color: #f0f0f8 !important; }
          .svc-modal-wrap .text-symbol-gray-600, .svc-modal-wrap .text-symbol-gray-700, .svc-modal-wrap .text-gray-600 { color: #9090a8 !important; }
          .svc-modal-wrap .text-symbol-black, .svc-modal-wrap .text-gray-900, .svc-modal-wrap .text-elite-charcoal-800 { color: #f0f0f8 !important; }
          .svc-modal-wrap input, .svc-modal-wrap select, .svc-modal-wrap textarea { background: #1c1c26 !important; border-color: #2a2a38 !important; color: #f0f0f8 !important; border-radius: 8px !important; }
          .svc-modal-wrap input:focus, .svc-modal-wrap select:focus { border-color: #c9a84c !important; box-shadow: 0 0 0 2px rgba(201,168,76,0.15) !important; }
          .svc-modal-wrap input::placeholder { color: #606078 !important; }
          .svc-modal-wrap .bg-white, .svc-modal-wrap .bg-symbol-white, .svc-modal-wrap .bg-gray-50, .svc-modal-wrap .bg-symbol-gray-50 { background: #1c1c26 !important; }
          .svc-modal-wrap .border-symbol-gray-200, .svc-modal-wrap .border-gray-200 { border-color: #2a2a38 !important; }
          .svc-modal-wrap .symbol-card, .svc-modal-wrap [class*=symbol-card] { background: #1c1c26 !important; border-color: #2a2a38 !important; }
          .svc-modal-wrap button[type=button]:not([class*=gold]) { background: rgba(255,255,255,0.05) !important; border-color: #2a2a38 !important; color: #9090a8 !important; }
          .svc-modal-wrap button[type=button]:not([class*=gold]):hover { border-color: #3a3a4a !important; color: #f0f0f8 !important; }
          .svc-modal-wrap button[type=submit], .svc-modal-wrap .bg-symbol-black, .svc-modal-wrap .bg-gray-900 { background: linear-gradient(135deg,#c9a84c,#8a6520) !important; color: #0a0a0f !important; border: none !important; }
          .svc-modal-wrap .text-symbol-gold, .svc-modal-wrap .text-amber-600 { color: #c9a84c !important; }
          .svc-modal-wrap .text-emerald-600, .svc-modal-wrap .text-green-600 { color: #00c896 !important; }
          .svc-modal-wrap .text-red-600, .svc-modal-wrap .text-rose-600 { color: #ff4d6a !important; }
          .svc-modal-wrap .text-blue-600 { color: #4d9fff !important; }
          .svc-modal-wrap .text-orange-600 { color: #fb923c !important; }
          .svc-modal-wrap [class*=bg-emerald], [class*=bg-green] { background: rgba(0,200,150,0.1) !important; }
          .svc-modal-wrap [class*=bg-red], [class*=bg-rose] { background: rgba(255,77,106,0.1) !important; }
          .svc-modal-wrap [class*=bg-blue] { background: rgba(77,159,255,0.1) !important; }
          .svc-modal-wrap [class*=bg-orange] { background: rgba(251,146,60,0.1) !important; }
          .svc-modal-wrap [class*=bg-amber], [class*=bg-yellow] { background: rgba(201,168,76,0.1) !important; }
          .svc-modal-wrap .rounded-lg, .svc-modal-wrap .rounded-xl { background: #1c1c26 !important; }
          .svc-modal-wrap hr, .svc-modal-wrap .divide-y > * { border-color: #2a2a38 !important; }
          /* Add material button */
          .svc-modal-wrap [class*=bg-symbol-gold] { background: linear-gradient(135deg,#c9a84c,#8a6520) !important; color: #0a0a0f !important; }
        `}</style>

        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 600, color: '#f0f0f8' }}>
            {service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
          </DialogTitle>
          <DialogDescription style={{ fontSize: 13, color: '#9090a8' }}>
            Configure o serviço e seus custos para análise de precificação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="svc-modal-wrap">
            <ServiceFormFields
              formData={{ ...formData, cardTaxRate: params.weightedAverageRate, serviceTaxRate: params.impostosRate }}
              onFormDataChange={setFormData}
            />
            <MaterialCostSection materialCosts={materialCosts} materials={materials} onMaterialCostsChange={setMaterialCosts} />
            <TaxRatesSection
              taxRates={{ cardTaxRate: params.weightedAverageRate, serviceTaxRate: params.impostosRate, commissionRate: formData.commissionRate }}
              onTaxRatesChange={(rates) => setFormData({ ...formData, commissionRate: rates.commissionRate })}
            />
            <FinancialSummary
              salePrice={formData.salePrice} commissionRate={formData.commissionRate}
              commissionCost={costs.commissionCost} cardTaxRate={params.weightedAverageRate}
              cardTaxCost={costs.cardTaxCost} serviceTaxRate={params.impostosRate}
              serviceTaxCost={costs.serviceTaxCost} materialCost={costs.materialTotal}
              materialCostPercentage={costs.materialCostPercentage} totalDirectCosts={costs.totalDirectCosts}
              totalDirectCostsPercentage={costs.totalDirectCostsPercentage} operationalMargin={costs.operationalMargin}
              operationalMarginPercentage={costs.operationalMarginPercentage} operationalCost={costs.operationalCost}
              operationalCostPercentage={params.despesasIndiretasDepreciacao} partialProfit={costs.partialProfit}
              partialProfitPercentage={costs.partialProfitPercentage}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a38', borderRadius: 10, padding: '10px 20px', fontSize: 13, color: '#9090a8', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Cancelar
              </button>
              <button type="submit" style={{ background: 'linear-gradient(135deg,#c9a84c,#8a6520)', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {service ? 'Salvar Alterações' : 'Adicionar Serviço'}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;
