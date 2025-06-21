import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  isActive: boolean;
  distributionPercentage: number;
  taxRate: number;
}

interface PaymentMethodTableProps {
  paymentMethods: PaymentMethod[];
  totalDistribution: number;
  weightedAverageRate: number;
  onUpdate: (id: string, field: keyof PaymentMethod, value: string | number | boolean) => void;
}

export const PaymentMethodTable = ({
  paymentMethods,
  totalDistribution,
  weightedAverageRate,
  onUpdate
}: PaymentMethodTableProps) => {
  return (
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
                    onCheckedChange={(checked) => onUpdate(method.id, 'isActive', checked)}
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
                      onChange={(e) => onUpdate(method.id, 'distributionPercentage', parseFloat(e.target.value) || 0)}
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
                      onChange={(e) => onUpdate(method.id, 'taxRate', parseFloat(e.target.value) || 0)}
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
  );
};
