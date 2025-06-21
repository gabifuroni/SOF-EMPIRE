import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Save } from 'lucide-react';

interface TeamSectionProps {
  numProfessionals: number;
  setNumProfessionals: (value: number) => void;
  isSaving: boolean;
  onSave: () => void;
}

export const TeamSection = ({
  numProfessionals,
  setNumProfessionals,
  isSaving,
  onSave
}: TeamSectionProps) => {
  return (
    <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-symbol-gold" size={20} />
          <h2 className="brand-heading text-xl text-symbol-black">
            Equipe
          </h2>
        </div>
        <div className="w-8 h-px bg-symbol-beige"></div>
      </div>
      
      <div className="w-full max-w-md">
        <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide mb-2 block">
          Número de Profissionais
        </Label>
        <Input
          type="number"
          min="1"
          value={numProfessionals}
          onChange={(e) => setNumProfessionals(parseInt(e.target.value) || 1)}
          className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black w-full"
        />
      </div>
      
      {/* Save Team Button */}
      <div className="mt-6 flex justify-center">
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Dados da Equipe'}
        </Button>
      </div>
    </div>
  );
};
