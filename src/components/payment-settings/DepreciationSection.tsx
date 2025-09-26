import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Save, FileSpreadsheet } from 'lucide-react';

interface DepreciationSectionProps {
  valorMobilizado: number;
  setValorMobilizado: (value: number) => void;
  totalDepreciado: number;
  setTotalDepreciado: (value: number) => void;
  depreciacaoMensal: number;
  isSaving: boolean;
  onSave: () => void;
  addToIndirectExpenses: boolean;
  setAddToIndirectExpenses: (value: boolean) => void;
  isAddingToIndirectExpenses: boolean;
}

export const DepreciationSection = ({
  valorMobilizado,
  setValorMobilizado,
  totalDepreciado,
  setTotalDepreciado,
  depreciacaoMensal,
  isSaving,
  onSave,
  addToIndirectExpenses,
  setAddToIndirectExpenses,
  isAddingToIndirectExpenses
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
          <div className="relative">
            <div className="flex items-center justify-between p-4 bg-symbol-beige/30 border-2 border-symbol-gold/40 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-symbol-gray-600 text-sm">R$</span>
                <span className="text-2xl font-bold text-symbol-black">
                  {depreciacaoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-symbol-gold text-symbol-black text-xs font-medium rounded-full uppercase tracking-wide">
                  CALCULADO
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-symbol-gray-500 mt-1">
            Calculado automaticamente: Total a ser Depreciado ÷ 60
          </p>
        </div>
      </div>
      
      {/* Add to Indirect Expenses Option */}
      <div className="mt-6 p-4 bg-symbol-beige/20 rounded-lg border border-symbol-beige/30">
        <div className="flex items-center gap-3 mb-3">
          <FileSpreadsheet className="text-symbol-gold" size={18} />
          <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
            Incluir nas Despesas Indiretas
          </Label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="add-to-indirect"
            checked={addToIndirectExpenses}
            onCheckedChange={(checked) => setAddToIndirectExpenses(checked === true)}
            className="border-symbol-gold data-[state=checked]:bg-symbol-gold data-[state=checked]:border-symbol-gold"
          />
          <Label htmlFor="add-to-indirect" className="text-sm text-symbol-gray-700 cursor-pointer">
            Adicionar automaticamente a depreciação mensal como despesa indireta fixa
          </Label>
        </div>
        <p className="text-xs text-symbol-gray-500 mt-2 ml-6">
          Quando ativado, o valor da depreciação mensal será automaticamente incluído como uma categoria de despesa indireta fixa em todos os meses.
        </p>
      </div>
      
      {/* Save Depreciation Button */}
      <div className="mt-6 flex justify-center">
        <Button 
          onClick={onSave}
          disabled={isSaving || isAddingToIndirectExpenses}
          className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving || isAddingToIndirectExpenses ? 'Salvando...' : 'Salvar Dados de Depreciação'}
        </Button>
      </div>
    </div>
  );
};
