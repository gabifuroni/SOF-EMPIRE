import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  
  const [formData, setFormData] = useState({
    name: '',
    salePrice: 0,
    commissionRate: 25.0
  });
  const [materialCosts, setMaterialCosts] = useState<MaterialCost[]>([]);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        salePrice: service.salePrice,
        commissionRate: service.commissionRate
      });
      setMaterialCosts(service.materialCosts || []);
    } else {
      setFormData({
        name: '',
        salePrice: 0,
        commissionRate: 25.0
      });
      setMaterialCosts([]);
    }
  }, [service, show]);

  const calculateCosts = () => {
    const materialTotal = materialCosts.reduce((sum, mc) => sum + mc.cost, 0);
    const cardTaxCost = (formData.salePrice * params.weightedAverageRate) / 100;
    const serviceTaxCost = (formData.salePrice * params.impostosRate) / 100;
    const commissionCost = (formData.salePrice * formData.commissionRate) / 100;
    
    const totalDirectCosts = materialTotal + cardTaxCost + serviceTaxCost + commissionCost;
    const materialCostPercentage = formData.salePrice > 0 ? (materialTotal / formData.salePrice) * 100 : 0;
    const totalDirectCostsPercentage = formData.salePrice > 0 ? (totalDirectCosts / formData.salePrice) * 100 : 0;
    
    // Margem Operacional = Preço - Custos Diretos
    const operationalMargin = formData.salePrice - totalDirectCosts;
    const operationalMarginPercentage = formData.salePrice > 0 ? (operationalMargin / formData.salePrice) * 100 : 0;
    
    // Custo Operacional (despesas indiretas)
    const operationalCost = (formData.salePrice * params.despesasIndiretasDepreciacao) / 100;
    
    // Lucro Parcial = Margem Operacional - Custo Operacional
    const partialProfit = operationalMargin - operationalCost;
    const partialProfitPercentage = formData.salePrice > 0 ? (partialProfit / formData.salePrice) * 100 : 0;
    
    return { 
      totalCost: totalDirectCosts,
      grossProfit: operationalMargin,
      profitMargin: operationalMarginPercentage,
      operationalCost, 
      operationalProfit: partialProfit,
      cardTaxCost,
      serviceTaxCost,
      commissionCost,
      materialTotal,
      materialCostPercentage,
      totalDirectCosts,
      totalDirectCostsPercentage,
      operationalMargin,
      operationalMarginPercentage,
      partialProfit,
      partialProfitPercentage
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { totalCost, grossProfit, profitMargin } = calculateCosts();
    
    onSave({
      ...formData,
      cardTaxRate: params.weightedAverageRate,
      serviceTaxRate: params.impostosRate,
      materialCosts,
      totalCost,
      grossProfit,
      profitMargin
    });
    onClose();
  };

  if (!show) return null;

  const { 
    totalCost, 
    grossProfit, 
    profitMargin, 
    operationalCost, 
    operationalProfit, 
    cardTaxCost,
    serviceTaxCost,
    commissionCost,
    materialTotal,
    materialCostPercentage,
    totalDirectCosts,
    totalDirectCostsPercentage,
    operationalMargin,
    operationalMarginPercentage,
    partialProfit,
    partialProfitPercentage
  } = calculateCosts();

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-symbol-white">
        <DialogHeader>
          <DialogTitle className="brand-heading text-2xl text-symbol-black">
            {service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
          </DialogTitle>
          <DialogDescription className="brand-body text-symbol-gray-600">
            Configure o serviço e seus custos para análise de precificação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ServiceFormFields
            formData={{
              ...formData,
              cardTaxRate: params.weightedAverageRate,
              serviceTaxRate: params.impostosRate
            }}
            onFormDataChange={setFormData}
          />

          <MaterialCostSection
            materialCosts={materialCosts}
            materials={materials}
            onMaterialCostsChange={setMaterialCosts}
          />

          <TaxRatesSection
            taxRates={{
              cardTaxRate: params.weightedAverageRate,
              serviceTaxRate: params.impostosRate,
              commissionRate: formData.commissionRate
            }}
            onTaxRatesChange={(rates) => setFormData({ ...formData, commissionRate: rates.commissionRate })}
          />

          <FinancialSummary
            salePrice={formData.salePrice}
            commissionRate={formData.commissionRate}
            commissionCost={commissionCost}
            cardTaxRate={params.weightedAverageRate}
            cardTaxCost={cardTaxCost}
            serviceTaxRate={params.impostosRate}
            serviceTaxCost={serviceTaxCost}
            materialCost={materialTotal}
            materialCostPercentage={materialCostPercentage}
            totalDirectCosts={totalDirectCosts}
            totalDirectCostsPercentage={totalDirectCostsPercentage}
            operationalMargin={operationalMargin}
            operationalMarginPercentage={operationalMarginPercentage}
            operationalCost={operationalCost}
            operationalCostPercentage={params.despesasIndiretasDepreciacao}
            partialProfit={partialProfit}
            partialProfitPercentage={partialProfitPercentage}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-symbol-gray-300 text-symbol-gray-700 hover:bg-symbol-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white"
            >
              {service ? 'Salvar Alterações' : 'Adicionar Serviço'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;
