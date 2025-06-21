import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, Save } from 'lucide-react';

interface MarginsConfigurationProps {
  lucroDesejado: number;
  setLucroDesejado: (value: number) => void;
  despesasIndiretasDepreciacao: number;
  setDespesasIndiretasDepreciacao: (value: number) => void;
  despesasDiretas: number;
  impostosRate: number;
  setImpostosRate: (value: number) => void;
  isSaving: boolean;
  onSave: () => void;
}

export const MarginsConfiguration = ({
  lucroDesejado,
  setLucroDesejado,
  despesasIndiretasDepreciacao,
  setDespesasIndiretasDepreciacao,
  despesasDiretas,
  impostosRate,
  setImpostosRate,
  isSaving,
  onSave
}: MarginsConfigurationProps) => {
  return (
    <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Percent className="text-symbol-gold" size={20} />
          <h2 className="brand-heading text-xl text-symbol-black">
            Configuração de Margens
          </h2>
        </div>
        <div className="w-8 h-px bg-symbol-beige"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
            Lucro Desejado (%)
          </Label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={lucroDesejado}
              onChange={(e) => setLucroDesejado(parseFloat(e.target.value) || 0)}
              className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-symbol-gray-600 text-sm">%</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
            Despesas Indiretas + Depreciação (%)
          </Label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={despesasIndiretasDepreciacao}
              onChange={(e) => setDespesasIndiretasDepreciacao(parseFloat(e.target.value) || 0)}
              className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-symbol-gray-600 text-sm">%</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide">
            Despesas Diretas (%)
          </Label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={despesasDiretas}
              readOnly
              className="bg-symbol-gray-100 border-symbol-gray-300 text-symbol-black pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-symbol-gray-600 text-sm">%</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-symbol-beige/20 rounded-lg">
        <span className="brand-body text-sm font-medium text-symbol-black">
          Total das margens: 100.0%
        </span>
      </div>
      
      {/* Tax Rate Section */}
      <div className="mt-6 p-4 bg-symbol-gold/10 rounded-lg">
        <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide mb-3 block">
          Taxa de Impostos (%)
        </Label>
        <div className="relative w-full max-w-xs">
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={impostosRate}
            onChange={(e) => setImpostosRate(parseFloat(e.target.value) || 0)}
            className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black pr-8 w-full"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-symbol-gray-600 text-sm">%</span>
        </div>
        <p className="text-xs text-symbol-gray-500 mt-1">
          Taxa fixa de impostos aplicada aos serviços
        </p>
      </div>
      
      {/* Save Margins Button */}
      <div className="mt-6 flex justify-center">
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
