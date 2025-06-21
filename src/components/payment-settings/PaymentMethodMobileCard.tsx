import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  isActive: boolean;
  distributionPercentage: number;
  taxRate: number;
}

interface PaymentMethodMobileCardProps {
  method: PaymentMethod;
  onUpdate: (id: string, field: keyof PaymentMethod, value: string | number | boolean) => void;
}

export const PaymentMethodMobileCard = ({
  method,
  onUpdate
}: PaymentMethodMobileCardProps) => {
  const IconComponent = method.icon;

  return (
    <div className="symbol-card p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent size={20} className="text-symbol-gray-600" />
            <span className="brand-subheading text-symbol-black text-sm">{method.name}</span>
          </div>
          <Switch
            checked={method.isActive}
            onCheckedChange={(checked) => onUpdate(method.id, 'isActive', checked)}
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
                onChange={(e) => onUpdate(method.id, 'distributionPercentage', parseFloat(e.target.value) || 0)}
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
                onChange={(e) => onUpdate(method.id, 'taxRate', parseFloat(e.target.value) || 0)}
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
};
