
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaxRatesData {
  cardTaxRate: number;
  serviceTaxRate: number;
  commissionRate: number;
}

interface TaxRatesSectionProps {
  taxRates: TaxRatesData;
  onTaxRatesChange: (rates: TaxRatesData) => void;
}

const TaxRatesSection = ({ taxRates, onTaxRatesChange }: TaxRatesSectionProps) => {
  const handleChange = (field: keyof TaxRatesData, value: number) => {
    onTaxRatesChange({ ...taxRates, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label htmlFor="cardTaxRate">Taxa de Cartão (%) - Fixa</Label>
        <Input
          id="cardTaxRate"
          type="number"
          step="0.1"
          value={taxRates.cardTaxRate}
          readOnly
          className="bg-gray-100 border-elite-pearl-300 text-gray-600 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500">Valor baseado na média ponderada</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceTaxRate">Imposto sobre Serviço (%) - Fixo</Label>
        <Input
          id="serviceTaxRate"
          type="number"
          step="0.1"
          value={taxRates.serviceTaxRate}
          readOnly
          className="bg-gray-100 border-elite-pearl-300 text-gray-600 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500">Taxa fixa de impostos</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="commissionRate">Comissão/Rateio (%)</Label>
        <Input
          id="commissionRate"
          type="number"
          step="0.1"
          value={taxRates.commissionRate}
          onChange={(e) => handleChange('commissionRate', parseFloat(e.target.value) || 0)}
          className="bg-transparent border-elite-pearl-300 focus:border-elite-rose-400"
        />
      </div>
    </div>
  );
};

export default TaxRatesSection;
