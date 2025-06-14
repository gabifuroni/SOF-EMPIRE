
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ServiceFormData {
  name: string;
  salePrice: number;
  cardTaxRate: number;
  serviceTaxRate: number;
  commissionRate: number;
}

interface ServiceFormFieldsProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
}

const ServiceFormFields = ({ formData, onFormDataChange }: ServiceFormFieldsProps) => {
  const handleChange = (field: keyof ServiceFormData, value: string | number) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Serviço</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ex: Corte + Escova"
          required
          className="bg-transparent border-elite-pearl-300 focus:border-elite-rose-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
        <Input
          id="salePrice"
          type="number"
          step="0.01"
          value={formData.salePrice}
          onChange={(e) => handleChange('salePrice', parseFloat(e.target.value) || 0)}
          placeholder="0,00"
          required
          className="bg-transparent border-elite-pearl-300 focus:border-elite-rose-400"
        />
      </div>
    </div>
  );
};

export default ServiceFormFields;
