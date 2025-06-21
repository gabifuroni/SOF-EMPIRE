import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Save } from 'lucide-react';

interface Holiday {
  id: string;
  date: string;
  name: string;
}

interface WorkingDays {
  segunda: boolean;
  terca: boolean;
  quarta: boolean;
  quinta: boolean;
  sexta: boolean;
  sabado: boolean;
  domingo: boolean;
}

interface WorkingDaysSectionProps {
  workingDays: WorkingDays;
  setWorkingDays: React.Dispatch<React.SetStateAction<WorkingDays>>;
  holidays: Holiday[];
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
  newHolidayDate: string;
  setNewHolidayDate: (value: string) => void;
  newHolidayName: string;
  setNewHolidayName: (value: string) => void;
  workingDaysPerYear: number;
  isSaving: boolean;
  onAddHoliday: () => void;
  onRemoveHoliday: (id: string) => void;
  onSave: () => void;
}

export const WorkingDaysSection = ({
  workingDays,
  setWorkingDays,
  holidays,
  newHolidayDate,
  setNewHolidayDate,
  newHolidayName,
  setNewHolidayName,
  workingDaysPerYear,
  isSaving,
  onAddHoliday,
  onRemoveHoliday,
  onSave
}: WorkingDaysSectionProps) => {
  return (
    <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="text-symbol-gold" size={20} />
          <h2 className="brand-heading text-xl text-symbol-black">
            Dias Trabalhados no Ano
          </h2>
        </div>
        <div className="w-8 h-px bg-symbol-beige"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Days of Work */}
        <div>
          <h3 className="brand-subheading text-symbol-black text-lg mb-4">Dias que Trabalha</h3>
          <div className="space-y-3">
            {[
              { key: 'segunda', label: 'Segunda-feira' },
              { key: 'terca', label: 'Terça-feira' },
              { key: 'quarta', label: 'Quarta-feira' },
              { key: 'quinta', label: 'Quinta-feira' },
              { key: 'sexta', label: 'Sexta-feira' },
              { key: 'sabado', label: 'Sábado' },
              { key: 'domingo', label: 'Domingo' }
            ].map((day) => (
              <div key={day.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={day.key}
                  checked={workingDays[day.key as keyof typeof workingDays]}
                  onChange={(e) => setWorkingDays(prev => ({
                    ...prev,
                    [day.key]: e.target.checked
                  }))}
                  className="w-4 h-4 text-symbol-gold bg-symbol-gray-100 border-symbol-gray-300 rounded focus:ring-symbol-gold"
                />
                <Label htmlFor={day.key} className="brand-body text-symbol-black text-sm">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Holidays */}
        <div>
          <h3 className="brand-subheading text-symbol-black text-lg mb-4">Feriados do Ano</h3>
          
          {/* Add new holiday */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black text-sm w-full"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Nome do feriado"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="bg-symbol-gray-50 border-symbol-gray-300 text-symbol-black text-sm w-full"
                />
              </div>
              <Button
                onClick={onAddHoliday}
                size="sm"
                className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black px-4 py-2 whitespace-nowrap"
              >
                Adicionar
              </Button>
            </div>
          </div>

          {/* Holidays list */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-2 bg-symbol-gray-50 rounded">
                <div>
                  <span className="brand-body text-symbol-black text-sm font-medium">{holiday.name}</span>
                  <span className="text-symbol-gray-600 text-xs ml-2">
                    {new Date(holiday.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <Button
                  onClick={() => onRemoveHoliday(holiday.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-symbol-beige/20 rounded">
            <span className="brand-body text-symbol-black text-sm font-medium">
              Total de dias trabalhados no ano: {workingDaysPerYear} dias
            </span>
          </div>
        </div>
      </div>
      
      {/* Save Working Days Button */}
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
