import { Button } from '@/components/ui/button';
import { Calculator, Users, Save } from 'lucide-react';

interface PaymentMethodActionsProps {
  totalDistribution: number;
  paymentMethodsLength: number;
  isSaving: boolean;
  onNormalize: () => void;
  onCleanDuplicates: () => void;
  onSave: () => void;
  onReset: () => void;
}

export const PaymentMethodActions = ({
  totalDistribution,
  paymentMethodsLength,
  isSaving,
  onNormalize,
  onCleanDuplicates,
  onSave,
  onReset
}: PaymentMethodActionsProps) => {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
      {Math.abs(totalDistribution - 100) > 0.01 && (
        <Button
          onClick={onNormalize}
          variant="outline"
          className="border-symbol-gold text-symbol-gold hover:bg-symbol-gold hover:text-white w-full sm:w-auto"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Ajustar para 100%
        </Button>
      )}
      
      {/* Show clean duplicates button if there are potential duplicates */}
      {paymentMethodsLength > 5 && (
        <Button
          onClick={onCleanDuplicates}
          variant="outline"
          className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white w-full sm:w-auto"
        >
          <Users className="w-4 h-4 mr-2" />
          Limpar Duplicatas
        </Button>
      )}
      
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-2 px-4 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
      >
        <Save size={16} />
        {isSaving ? 'Salvando...' : 'Salvar Métodos de Pagamento'}
      </Button>
      
      <Button
        onClick={onReset}
        variant="outline"
        className="border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white w-full sm:w-auto"
      >
        Reset Padrão
      </Button>
    </div>
  );
};
