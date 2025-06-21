import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Save } from 'lucide-react';

interface DepreciationSectionProps {
  valorMobilizado: number;
  setValorMobilizado: (value: number) => void;
  totalDepreciado: number;
  setTotalDepreciado: (value: number) => void;
  depreciacaoMensal: number;
  isSaving: boolean;
  onSave: () => void;
}

export const DepreciationSection = ({
  valorMobilizado,
  setValorMobilizado,
  totalDepreciado,
  setTotalDepreciado,
  depreciacaoMensal,
  isSaving,
  onSave
}: DepreciationSectionProps) => {
  return (
    <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="text-symbol-gold" size={20} />
          <h2 className="brand-heading text-xl text-symbol-black">
            Cálculo de Depreciação
          </h2>
        </div>
        <div className="w-8 h-px bg-symbol-beige"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
            Valor Mobilizado
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-symbol-gray-600 text-sm">R$</span>
            <Input
              type="number"
              step="0.01"
              value={valorMobilizado}
              onChange={(e) => setValorMobilizado(parseFloat(e.target.value) || 0)}
              className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
            Total a ser Depreciado
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-symbol-gray-600 text-sm">R$</span>
            <Input
              type="number"
              step="0.01"
              value={totalDepreciado}
              onChange={(e) => setTotalDepreciado(parseFloat(e.target.value) || 0)}
              className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
            Depreciação Mensal
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-symbol-gray-600 text-sm">R$</span>
            <Input
              type="number"
              step="0.01"
              value={depreciacaoMensal.toFixed(2)}
              readOnly
              className="bg-symbol-gray-100 border-symbol-gray-300 text-symbol-black cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-symbol-gray-500 mt-1">
            Calculado automaticamente: Total a ser Depreciado ÷ 60
          </p>
        </div>
      </div>
      
      {/* Save Depreciation Button */}
      <div className="mt-6 flex justify-center">
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Dados de Depreciação'}
        </Button>
      </div>
    </div>
  );
};
