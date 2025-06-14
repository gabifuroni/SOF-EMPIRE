import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  isActive: boolean;
  distributionPercentage: number;
  taxRate: number;
}

const PaymentSettings = () => {
  const { toast } = useToast();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'credit',
      name: 'Crédito',
      icon: CreditCard,
      isActive: true,
      distributionPercentage: 50.0,
      taxRate: 3.20
    },
    {
      id: 'credit_installment',
      name: 'Crédito Parcelado',
      icon: CreditCard,
      isActive: true,
      distributionPercentage: 5.0,
      taxRate: 6.34
    },
    {
      id: 'debit',
      name: 'Débito',
      icon: CreditCard,
      isActive: true,
      distributionPercentage: 15.0,
      taxRate: 1.39
    },
    {
      id: 'cash',
      name: 'Dinheiro/Cheque',
      icon: Banknote,
      isActive: true,
      distributionPercentage: 30.0,
      taxRate: 0.00
    }
  ]);

  const updatePaymentMethod = (id: string, field: keyof PaymentMethod, value: any) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id 
          ? { ...method, [field]: value }
          : method
      )
    );
  };

  const calculateWeightedAverageRate = () => {
    const activeMethods = paymentMethods.filter(method => method.isActive);
    const totalDistribution = activeMethods.reduce((sum, method) => sum + method.distributionPercentage, 0);
    
    if (totalDistribution === 0) return 0;
    
    const weightedSum = activeMethods.reduce((sum, method) => 
      sum + (method.taxRate * method.distributionPercentage), 0
    );
    
    return weightedSum / totalDistribution;
  };

  const getTotalDistribution = () => {
    return paymentMethods
      .filter(method => method.isActive)
      .reduce((sum, method) => sum + method.distributionPercentage, 0);
  };

  const handleSaveSettings = () => {
    const totalDistribution = getTotalDistribution();
    
    if (Math.abs(totalDistribution - 100) > 0.01) {
      toast({
        title: "Erro de Validação",
        description: "A soma dos percentuais de distribuição deve ser igual a 100%",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso!",
      description: "Configurações de pagamento salvas com sucesso!",
      variant: "default"
    });
  };

  const weightedAverageRate = calculateWeightedAverageRate();
  const totalDistribution = getTotalDistribution();

  return (
    <div className="space-y-8 p-6 animate-minimal-fade">
      <div className="mb-8">
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Parâmetros do Negócio
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Configure as taxas e distribuição percentual das formas de pagamento para cálculo da média ponderada
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <div key={method.id} className="symbol-card p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent size={20} className="text-symbol-gray-600" />
                    <span className="brand-subheading text-symbol-black text-sm">{method.name}</span>
                  </div>
                  <Switch
                    checked={method.isActive}
                    onCheckedChange={(checked) => updatePaymentMethod(method.id, 'isActive', checked)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-symbol-gray-300"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="brand-body text-symbol-gray-700 text-xs uppercase tracking-wide">
                      Distribuição
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={method.distributionPercentage}
                        onChange={(e) => updatePaymentMethod(method.id, 'distributionPercentage', parseFloat(e.target.value) || 0)}
                        className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black"
                        disabled={!method.isActive}
                      />
                      <span className="text-symbol-gray-600 text-sm">%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="brand-body text-symbol-gray-700 text-xs uppercase tracking-wide">
                      Taxa
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={method.taxRate}
                        onChange={(e) => updatePaymentMethod(method.id, 'taxRate', parseFloat(e.target.value) || 0)}
                        className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black"
                        disabled={!method.isActive}
                      />
                      <span className="text-symbol-gray-600 text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Percentual de recebimento por Forma de Pagamento
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-symbol-gray-200">
                <th className="text-left py-4 px-2 brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Forma de Pagamento
                </th>
                <th className="text-center py-4 px-2 brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Ativo
                </th>
                <th className="text-right py-4 px-2 brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Distribuição
                </th>
                <th className="text-right py-4 px-2 brand-subheading text-symbol-gray-700 text-sm uppercase tracking-wide">
                  Taxa
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <tr key={method.id} className="border-b border-symbol-gray-100 hover:bg-symbol-gray-50/50">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <IconComponent size={18} className="text-symbol-gray-600" />
                        <span className="brand-body text-symbol-black">{method.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Switch
                        checked={method.isActive}
                        onCheckedChange={(checked) => updatePaymentMethod(method.id, 'isActive', checked)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-symbol-gray-300"
                      />
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={method.distributionPercentage}
                          onChange={(e) => updatePaymentMethod(method.id, 'distributionPercentage', parseFloat(e.target.value) || 0)}
                          className="w-20 text-right bg-symbol-gray-50 border-symbol-gray-300"
                          disabled={!method.isActive}
                        />
                        <span className="text-symbol-gray-600">%</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={method.taxRate}
                          onChange={(e) => updatePaymentMethod(method.id, 'taxRate', parseFloat(e.target.value) || 0)}
                          className="w-20 text-right bg-symbol-gray-50 border-symbol-gray-300"
                          disabled={!method.isActive}
                        />
                        <span className="text-symbol-gray-600">%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-symbol-gray-300 bg-symbol-gray-50">
                <td className="py-4 px-2 brand-subheading text-symbol-black">Total</td>
                <td className="py-4 px-2"></td>
                <td className="py-4 px-2 text-right">
                  <span className={`font-semibold ${
                    Math.abs(totalDistribution - 100) > 0.01 
                      ? 'text-red-600' 
                      : 'text-symbol-black'
                  }`}>
                    {totalDistribution.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="font-semibold text-symbol-gold">
                    {weightedAverageRate.toFixed(2)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="symbol-card p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Resumo dos Cálculos
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="brand-heading text-3xl text-yoni-black mb-2">
              {paymentMethods.filter(m => m.isActive).length}
            </div>
            <div className="brand-body text-yoni-gray-600 text-sm uppercase tracking-wide">
              Formas Ativas
            </div>
          </div>
          <div className="text-center">
            <div className={`brand-heading text-3xl mb-2 ${
              Math.abs(totalDistribution - 100) > 0.01 
                ? 'text-red-600' 
                : 'text-yoni-black'
            }`}>
              {totalDistribution.toFixed(1)}%
            </div>
            <div className="brand-body text-yoni-gray-600 text-sm uppercase tracking-wide">
              Total Distribuição
            </div>
          </div>
          <div className="text-center">
            <div className="brand-heading text-3xl text-yoni-gold mb-2">
              {weightedAverageRate.toFixed(2)}%
            </div>
            <div className="brand-body text-yoni-gray-600 text-sm uppercase tracking-wide">
              Taxa Média Ponderada
            </div>
          </div>
        </div>
        
        {Math.abs(totalDistribution - 100) > 0.01 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200">
            <p className="text-red-700 brand-body text-sm">
              ⚠️ A soma dos percentuais de distribuição deve ser igual a 100%. 
              Ajuste os valores antes de salvar.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-8">
        <Button 
          onClick={handleSaveSettings}
          className="w-full sm:w-auto bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-4 px-8 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
        >
          <Save size={20} />
          Salvar Parâmetros do Negócio
        </Button>
      </div>
    </div>
  );
};

export default PaymentSettings;
