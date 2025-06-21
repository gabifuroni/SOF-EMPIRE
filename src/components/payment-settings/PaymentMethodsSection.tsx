import { PaymentMethodMobileCard } from './PaymentMethodMobileCard';
import { PaymentMethodTable } from './PaymentMethodTable';
import { PaymentMethodActions } from './PaymentMethodActions';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  isActive: boolean;
  distributionPercentage: number;
  taxRate: number;
}

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  totalDistribution: number;
  weightedAverageRate: number;
  isSaving: boolean;
  onUpdatePaymentMethod: (id: string, field: keyof PaymentMethod, value: string | number | boolean) => void;
  onNormalizeDistribution: () => void;
  onCleanDuplicates: () => void;
  onSavePaymentMethods: () => void;
  onResetToDefaults: () => void;
}

export const PaymentMethodsSection = ({
  paymentMethods,
  totalDistribution,
  weightedAverageRate,
  isSaving,
  onUpdatePaymentMethod,
  onNormalizeDistribution,
  onCleanDuplicates,
  onSavePaymentMethods,
  onResetToDefaults
}: PaymentMethodsSectionProps) => {
  return (
    <>
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {paymentMethods.map((method) => (
          <PaymentMethodMobileCard
            key={method.id}
            method={method}
            onUpdate={onUpdatePaymentMethod}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Percentual de recebimento por Forma de Pagamento
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        <PaymentMethodTable
          paymentMethods={paymentMethods}
          totalDistribution={totalDistribution}
          weightedAverageRate={weightedAverageRate}
          onUpdate={onUpdatePaymentMethod}
        />

        <PaymentMethodActions
          totalDistribution={totalDistribution}
          paymentMethodsLength={paymentMethods.length}
          isSaving={isSaving}
          onNormalize={onNormalizeDistribution}
          onCleanDuplicates={onCleanDuplicates}
          onSave={onSavePaymentMethods}
          onReset={onResetToDefaults}
        />
      </div>
    </>
  );
};
