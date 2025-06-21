import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Save,
  Calculator,
  Calendar,
  Users,
  Percent
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusinessParams } from '@/hooks/useBusinessParams';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  isActive: boolean;
  distributionPercentage: number;
  taxRate: number;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
}

const PaymentSettings = () => {
  const { toast } = useToast();
  const { params, updateParams } = useBusinessParams();
  const { saveSettings } = useBusinessSettings();
  const { paymentMethods: dbPaymentMethods, updatePaymentMethod: updateDbPaymentMethod } = usePaymentMethods();
  // Initialize with empty array - will be populated from database or defaults
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Add loading state for save operation
  // Function to remove duplicates and merge data
  const removeDuplicatePaymentMethods = useCallback((methods: PaymentMethod[]): PaymentMethod[] => {
    const uniqueMethods = new Map<string, PaymentMethod>();
      // Define similarity groups
    const similarityGroups: { [key: string]: string[] } = {};
    
    methods.forEach(method => {
      const name = method.name.toLowerCase().trim();
      
      // Find which group this method belongs to
      let groupKey = name;
      for (const [group, variations] of Object.entries(similarityGroups)) {
        if (variations.some(variation => name.includes(variation) || variation.includes(name))) {
          groupKey = group;
          break;
        }
      }
      
      if (!uniqueMethods.has(groupKey)) {        // Use a standardized name
        const standardNames: { [key: string]: string } = {
          'credito': 'Crédito',
          'credito_parcelado': 'Crédito Parcelado',
          'debito': 'Débito',
          'pix': 'PIX',
          'dinheiro': 'Dinheiro/Pix',
          'transferencia': 'Transferência Bancária'
        };
        
        uniqueMethods.set(groupKey, {
          ...method,
          name: standardNames[groupKey] || method.name,
          id: groupKey
        });
      } else {
        // If duplicate, merge the data (sum distribution percentages or keep higher values)
        const existing = uniqueMethods.get(groupKey)!;
        uniqueMethods.set(groupKey, {
          ...existing,
          distributionPercentage: Math.max(existing.distributionPercentage, method.distributionPercentage),
          taxRate: method.taxRate > 0 ? method.taxRate : existing.taxRate,
          isActive: existing.isActive || method.isActive
        });
      }
    });
    
    return Array.from(uniqueMethods.values());
  }, []);  // Default payment methods
  const getDefaultPaymentMethods = useCallback((): PaymentMethod[] => [
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
    },    {
      id: 'cash',
      name: 'Dinheiro/Pix',
      icon: Banknote,
      isActive: true,
      distributionPercentage: 30.0,
      taxRate: 0.00
    }
  ], []);
  // Depreciation state
  const [valorMobilizado, setValorMobilizado] = useState(0);
  const [totalDepreciado, setTotalDepreciado] = useState(0);
  // Depreciação mensal é calculada automaticamente: totalDepreciado / 60
  const depreciacaoMensal = totalDepreciado / 60;

  // Working days state
  const [workingDays, setWorkingDays] = useState({
    segunda: true,
    terca: true,
    quarta: true,
    quinta: true,
    sexta: true,
    sabado: false,
    domingo: false
  });

  // Holidays state
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: '1', date: '2024-01-01', name: 'Confraternização Universal' },
    { id: '2', date: '2024-04-21', name: 'Tiradentes' },
    { id: '3', date: '2024-09-07', name: 'Independência do Brasil' }
  ]);

  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  // Number of professionals
  const [numProfessionals, setNumProfessionals] = useState(2);  // Margins state - Fixed calculation to auto-adjust (matching the image: 21% + 35% + 44% = 100%)
  const [lucroDesejado, setLucroDesejado] = useState(21.0);
  const [despesasIndiretasDepreciacao, setDespesasIndiretasDepreciacao] = useState(35.0);
  const [impostosRate, setImpostosRate] = useState(8.0);
    // Auto-calculate despesas diretas to make total = 100%
  const despesasDiretas = 100 - lucroDesejado - despesasIndiretasDepreciacao;// Initialize form data with context values or database values
  useEffect(() => {
    console.log('PaymentSettings initialization:', {
      isInitialized,
      dbPaymentMethodsLength: dbPaymentMethods?.length || 0,
      paymentMethodsLength: paymentMethods.length
    });

    if (!isInitialized) {
      // Initialize from database payment methods first
      if (dbPaymentMethods && dbPaymentMethods.length > 0) {
        console.log('Initializing from database:', dbPaymentMethods);
        const mappedMethods = dbPaymentMethods.map(pm => ({
          id: pm.id,
          name: pm.nome_metodo,
          icon: pm.nome_metodo.toLowerCase().includes('crédito') || pm.nome_metodo.toLowerCase().includes('credit') ? CreditCard : 
               pm.nome_metodo.toLowerCase().includes('débito') || pm.nome_metodo.toLowerCase().includes('debit') ? CreditCard :
               pm.nome_metodo.toLowerCase().includes('pix') ? Smartphone : Banknote,
          isActive: pm.is_ativo,
          distributionPercentage: Math.max(0, Math.min(100, pm.prazo_recebimento_dias || 0)), // Clamp between 0-100
          taxRate: pm.taxa_percentual || 0
        }));        console.log('Mapped methods:', mappedMethods);
        const uniqueMethods = removeDuplicatePaymentMethods(mappedMethods);
        console.log('Unique methods after deduplication:', uniqueMethods);
        setPaymentMethods(uniqueMethods);
        setIsInitialized(true);
      } else if (paymentMethods.length === 0) {
        // Use default values if no database data
        console.log('Using default payment methods');
        setPaymentMethods(getDefaultPaymentMethods());
        setIsInitialized(true);
      }
    }
  }, [dbPaymentMethods, isInitialized, paymentMethods.length, getDefaultPaymentMethods, removeDuplicatePaymentMethods]);
  // Separate useEffect for business parameters initialization
  useEffect(() => {
    if (params) {
      console.log('Initializing business parameters from context:', params);
      setLucroDesejado(params.lucroDesejado || 21.0);
      setDespesasIndiretasDepreciacao(params.despesasIndiretasDepreciacao || 35.0);      setImpostosRate(params.impostosRate || 8.0);
      setValorMobilizado(params.depreciacaoValorMobilizado || 160000);
      setTotalDepreciado(params.depreciacaoTotalMesDepreciado || 87000);
      setNumProfessionals(params.equipeNumeroProfissionais || 2);
      
      // Inicializar dados de dias trabalhados se existirem no contexto
      if (params.trabalhaSegunda !== undefined) {
        setWorkingDays({
          segunda: params.trabalhaSegunda,
          terca: params.trabalhaTerca,
          quarta: params.trabalhaQuarta,
          quinta: params.trabalhaQuinta,
          sexta: params.trabalhaSexta,
          sabado: params.trabalhaSabado,
          domingo: params.trabalhaDomingo,
        });
      }
      
      // Inicializar feriados se existirem no contexto
      if (params.feriados && params.feriados.length > 0) {
        setHolidays(params.feriados);
      }
    }
  }, [params]); // Only depend on params
  const updatePaymentMethod = (id: string, field: keyof PaymentMethod, value: string | number | boolean) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id 
          ? { ...method, [field]: value }
          : method
      )
    );
  };

  const normalizeDistributionPercentages = () => {
    const activeMethods = paymentMethods.filter(method => method.isActive);
    const currentTotal = activeMethods.reduce((sum, method) => sum + method.distributionPercentage, 0);
    
    if (currentTotal === 0) {
      // Se todos estão em 0, distribuir igualmente
      const equalPercentage = 100 / activeMethods.length;
      setPaymentMethods(prev => 
        prev.map(method => 
          method.isActive 
            ? { ...method, distributionPercentage: equalPercentage }
            : method
        )
      );    } else {
      // Normalizar proporcionalmente
      const scaleFactor = 100 / currentTotal;
      setPaymentMethods(prev => 
        prev.map(method => 
          method.isActive 
            ? { ...method, distributionPercentage: method.distributionPercentage * scaleFactor }
            : method
        )
      );
    }
  };

  const cleanDuplicatesFromDatabase = async () => {
    try {
      const uniqueMethods = removeDuplicatePaymentMethods(paymentMethods);
      
      // Update the local state first
      setPaymentMethods(uniqueMethods);
      
      // Save cleaned data to database
      const savePromises = uniqueMethods.map(async (method) => {
        const dbMethod = dbPaymentMethods.find(m => 
          m.id === method.id || 
          m.nome_metodo.toLowerCase().includes(method.name.toLowerCase().split(' ')[0])
        );
          if (dbMethod && updateDbPaymentMethod) {
          await updateDbPaymentMethod.mutateAsync({
            id: dbMethod.id,
            nome_metodo: method.name,
            is_ativo: method.isActive,
            prazo_recebimento_dias: Math.round(method.distributionPercentage), // Convert to integer
            taxa_percentual: method.taxRate,
          });
        }
      });

      await Promise.allSettled(savePromises);
      
      toast({
        title: "Sucesso!",
        description: "Duplicatas removidas e dados limpos com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      toast({        title: "Erro",
        description: "Erro ao limpar duplicatas. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const resetToDefaults = async () => {
    const confirmed = window.confirm(
      "Isso irá resetar todos os métodos de pagamento para os valores padrão. Continuar?"
    );
    
    if (confirmed) {
      try {
        const defaultMethods = getDefaultPaymentMethods();
        setPaymentMethods(defaultMethods);
        
        toast({
          title: "Sucesso!",
          description: "Métodos de pagamento resetados para valores padrão!",
          variant: "default"
        });
      } catch (error) {
        console.error('Error resetting to defaults:', error);
        toast({
          title: "Erro",
          description: "Erro ao resetar valores. Tente novamente.",
          variant: "destructive"
        });
      }
    }
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

  const calculateWorkingDaysPerYear = () => {
    const daysPerWeek = Object.values(workingDays).filter(day => day).length;
    const totalWorkingDaysInYear = daysPerWeek * 52; // 52 weeks in a year
    return totalWorkingDaysInYear - holidays.length;
  };

  const addHoliday = () => {
    if (newHolidayDate && newHolidayName) {
      const newHoliday: Holiday = {
        id: Date.now().toString(),
        date: newHolidayDate,
        name: newHolidayName
      };
      setHolidays([...holidays, newHoliday]);
      setNewHolidayDate('');
      setNewHolidayName('');
    }
  };

  const removeHoliday = (id: string) => {
    setHolidays(holidays.filter(holiday => holiday.id !== id));
  };

  // Separate save functions for different sections
  const handleSaveMargins = async () => {
    setIsSaving(true);
    
    const totalMargins = lucroDesejado + despesasIndiretasDepreciacao + despesasDiretas;
    
    if (Math.abs(totalMargins - 100) > 0.01) {
      toast({
        title: "Erro de Validação",
        description: "A soma das margens deve ser igual a 100%",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }

    try {
      console.log('Saving margins with values:', {
        lucroDesejado,
        despesasIndiretasDepreciacao,
        despesasDiretas,
        impostosRate
      });

      await saveSettings.mutateAsync({
        lucroDesejado,
        taxaImpostos: impostosRate,
        taxaMediaPonderada: calculateWeightedAverageRate(),
        depreciacaoValorMobilizado: valorMobilizado,
        depreciacaoTotalMesDepreciado: totalDepreciado,
        depreciacaoMensal,
        diasTrabalhadosAno: calculateWorkingDaysPerYear(),
        equipeNumeroProfissionais: numProfessionals,
      });

      // Update context with new margin values
      updateParams({
        lucroDesejado,
        despesasIndiretasDepreciacao,
        despesasDiretas,
        impostosRate,
        depreciacaoValorMobilizado: valorMobilizado,
        depreciacaoTotalMesDepreciado: totalDepreciado,
        depreciacaoMensal,
        equipeNumeroProfissionais: numProfessionals,
        workingDaysPerYear: calculateWorkingDaysPerYear(),
      });

      toast({
        title: "Sucesso!",
        description: "Configurações de margens salvas com sucesso!",
        variant: "default"
      });    } catch (error) {
      console.error('Error saving margins:', error);
      
      let errorMessage = "Erro ao salvar configurações de margens. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('23505') || error.message.includes('duplicate')) {
          errorMessage = "Erro: Dados duplicados detectados. Tentando atualizar os dados existentes...";
          
          // Try to update instead of insert
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { error: updateError } = await supabase
                .from('parametros_negocio')
                .update({
                  lucro_desejado: lucroDesejado,
                  taxa_impostos: impostosRate,
                  taxa_media_ponderada: calculateWeightedAverageRate(),
                  depreciacao_valor_mobilizado: valorMobilizado,
                  depreciacao_total_mes_depreciado: totalDepreciado,
                  depreciacao_mensal: depreciacaoMensal,
                  dias_trabalhados_ano: calculateWorkingDaysPerYear(),
                  equipe_numero_profissionais: numProfessionals,
                })
                .eq('user_id', user.id);
                
              if (!updateError) {
                toast({
                  title: "Sucesso!",
                  description: "Configurações de margens atualizadas com sucesso!",
                  variant: "default"
                });
                return;
              }
            }
          } catch (updateError) {
            console.error('Error updating margins:', updateError);
          }
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDepreciation = async () => {
    setIsSaving(true);
    
    try {
      console.log('Salvando dados de depreciação:', {
        valorMobilizado,
        totalDepreciado,
        depreciacaoMensal
      });

      await saveSettings.mutateAsync({
        lucroDesejado,
        taxaImpostos: impostosRate,
        taxaMediaPonderada: calculateWeightedAverageRate(),
        depreciacaoValorMobilizado: valorMobilizado,
        depreciacaoTotalMesDepreciado: totalDepreciado,
        depreciacaoMensal,
        diasTrabalhadosAno: calculateWorkingDaysPerYear(),
        equipeNumeroProfissionais: numProfessionals,
      });

      // Update context with depreciation values
      updateParams({
        depreciacaoValorMobilizado: valorMobilizado,
        depreciacaoTotalMesDepreciado: totalDepreciado,
        depreciacaoMensal,
      });

      toast({
        title: "Sucesso!",
        description: "Dados de depreciação salvos com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving depreciation:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados de depreciação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Função para salvar apenas dados de dias trabalhados
  const handleSaveWorkingDays = async () => {
    setIsSaving(true);
    
    try {
      console.log('Salvando dados de dias trabalhados:', {
        workingDays,
        holidays,
        diasCalculados: calculateWorkingDaysPerYear()
      });

      await saveSettings.mutateAsync({
        lucroDesejado,
        taxaImpostos: impostosRate,
        taxaMediaPonderada: calculateWeightedAverageRate(),
        depreciacaoValorMobilizado: valorMobilizado,
        depreciacaoTotalMesDepreciado: totalDepreciado,
        depreciacaoMensal,
        diasTrabalhadosAno: calculateWorkingDaysPerYear(),
        equipeNumeroProfissionais: numProfessionals,
        // Adicionar campos de dias da semana
        trabalhaSegunda: workingDays.segunda,
        trabalhaTerca: workingDays.terca,
        trabalhaQuarta: workingDays.quarta,
        trabalhaQuinta: workingDays.quinta,
        trabalhaSexta: workingDays.sexta,
        trabalhaSabado: workingDays.sabado,
        trabalhaDomingo: workingDays.domingo,
        feriados: holidays,
      });

      // Update context with working days values
      updateParams({
        workingDaysPerYear: calculateWorkingDaysPerYear(),
        trabalhaSegunda: workingDays.segunda,
        trabalhaTerca: workingDays.terca,
        trabalhaQuarta: workingDays.quarta,
        trabalhaQuinta: workingDays.quinta,
        trabalhaSexta: workingDays.sexta,
        trabalhaSabado: workingDays.sabado,
        trabalhaDomingo: workingDays.domingo,
        feriados: holidays,
      });

      toast({
        title: "Sucesso!",
        description: "Configurações de dias trabalhados salvas com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving working days:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de dias trabalhados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Função para salvar apenas métodos de pagamento
  const handleSavePaymentMethods = async () => {
    setIsSaving(true);
    
    try {
      console.log('Salvando métodos de pagamento:', paymentMethods);

      // Validate total distribution
      const totalDistribution = getTotalDistribution();
      if (Math.abs(totalDistribution - 100) > 0.01) {
        toast({
          title: "Erro de Validação",
          description: "A soma das distribuições deve ser igual a 100%",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      // Save payment methods to database
      const savePromises = paymentMethods.map(async (method) => {
        const dbMethod = dbPaymentMethods.find(m => 
          m.id === method.id || 
          m.nome_metodo.toLowerCase().includes(method.name.toLowerCase().split(' ')[0])
        );
        
        if (dbMethod && updateDbPaymentMethod) {
          await updateDbPaymentMethod.mutateAsync({
            id: dbMethod.id,
            nome_metodo: method.name,
            is_ativo: method.isActive,
            prazo_recebimento_dias: Math.round(method.distributionPercentage),
            taxa_percentual: method.taxRate,
          });
        }
      });

      await Promise.allSettled(savePromises);

      // Update context with payment methods
      updateParams({
        paymentMethods: paymentMethods,
        weightedAverageRate: calculateWeightedAverageRate(),
      });

      toast({
        title: "Sucesso!",
        description: "Métodos de pagamento salvos com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving payment methods:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar métodos de pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Função para salvar apenas dados da equipe
  const handleSaveTeam = async () => {
    setIsSaving(true);
    
    try {
      console.log('Salvando dados de equipe:', {
        numProfessionals
      });

      await saveSettings.mutateAsync({
        lucroDesejado,
        taxaImpostos: impostosRate,
        taxaMediaPonderada: calculateWeightedAverageRate(),
        depreciacaoValorMobilizado: valorMobilizado,
        depreciacaoTotalMesDepreciado: totalDepreciado,
        depreciacaoMensal,
        diasTrabalhadosAno: calculateWorkingDaysPerYear(),
        equipeNumeroProfissionais: numProfessionals,
        // Valores padrão para os campos obrigatórios
        trabalhaSegunda: workingDays.segunda,
        trabalhaTerca: workingDays.terca,
        trabalhaQuarta: workingDays.quarta,
        trabalhaQuinta: workingDays.quinta,
        trabalhaSexta: workingDays.sexta,
        trabalhaSabado: workingDays.sabado,
        trabalhaDomingo: workingDays.domingo,
        feriados: holidays,
      });

      // Update context with team values
      updateParams({
        equipeNumeroProfissionais: numProfessionals,
      });

      toast({
        title: "Sucesso!",
        description: "Dados da equipe salvos com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados da equipe. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const weightedAverageRate = calculateWeightedAverageRate();
  const totalDistribution = getTotalDistribution();
  const workingDaysPerYear = calculateWorkingDaysPerYear();
  const totalMargins = lucroDesejado + despesasIndiretasDepreciacao + despesasDiretas;

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 animate-minimal-fade">
      <div className="mb-8">
        <h1 className="brand-heading text-3xl text-symbol-black mb-2">
          Parâmetros do Negócio
        </h1>
        <div className="w-12 h-px bg-symbol-gold mb-4"></div>
        <p className="brand-body text-symbol-gray-600">
          Configure todos os parâmetros do seu negócio para cálculos precisos
        </p>
      </div>      {/* Margins Configuration Section - Fixed alignment */}
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
            <div className="relative">              <Input
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
        </div>        <div className="mt-6 p-4 bg-symbol-beige/20 rounded-lg">
          <span className="brand-body text-sm font-medium text-symbol-black">
            Total das margens: 100.0%
          </span>
        </div>
        
        {/* Tax Rate Section */}
        <div className="mt-6 p-4 bg-symbol-gold/10 rounded-lg">
          <Label className="brand-body text-symbol-gray-700 text-sm uppercase tracking-wide mb-3 block">
            Taxa de Impostos (%)
          </Label>          <div className="relative w-full max-w-xs">
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
          </div><p className="text-xs text-symbol-gray-500 mt-1">
            Taxa fixa de impostos aplicada aos serviços
          </p>
        </div>
        
        {/* Save Margins Button */}
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleSaveMargins}
            disabled={isSaving}
            className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Configurações de Margens'}
          </Button>
        </div>
      </div>      {/* Depreciation Section */}
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
            onClick={handleSaveDepreciation}
            disabled={isSaving}
            className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Dados de Depreciação'}
          </Button>
        </div>
      </div>      {/* Working Days Section */}
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
              {/* Add new holiday */}            <div className="mb-4 space-y-3">
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
                  />                </div>
                <Button
                  onClick={addHoliday}
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
                    <span className="text-symbol-black text-sm font-medium">
                      {new Date(holiday.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-symbol-gray-600 text-sm ml-2">
                      {holiday.name}
                    </span>
                  </div>
                  <Button
                    onClick={() => removeHoliday(holiday.id)}
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
            onClick={handleSaveWorkingDays}
            disabled={isSaving}
            className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Configurações de Dias Trabalhados'}
          </Button>
        </div>
      </div>      {/* Number of Professionals */}
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
            onClick={handleSaveTeam}
            disabled={isSaving}
            className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-sm disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Dados da Equipe'}
          </Button>
        </div>
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
      </div>      {/* Desktop Table View */}
      <div className="hidden sm:block symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
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
              </tr>            </tbody>
          </table>
        </div>          {/* Action buttons */}        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {Math.abs(totalDistribution - 100) > 0.01 && (
            <Button
              onClick={normalizeDistributionPercentages}
              variant="outline"
              className="border-symbol-gold text-symbol-gold hover:bg-symbol-gold hover:text-white w-full sm:w-auto"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Ajustar para 100%
            </Button>
          )}
            {/* Show clean duplicates button if there are potential duplicates */}
          {paymentMethods.length > 5 && (
            <Button
              onClick={cleanDuplicatesFromDatabase}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white w-full sm:w-auto"
            >
              <Users className="w-4 h-4 mr-2" />
              Limpar Duplicatas
            </Button>          )}
          
          <Button
            onClick={handleSavePaymentMethods}
            disabled={isSaving}
            className="bg-symbol-gold hover:bg-symbol-gold/80 text-symbol-black font-medium py-2 px-4 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
          >
            <Save size={16} />
            {isSaving ? 'Salvando...' : 'Salvar Métodos de Pagamento'}
          </Button>
          
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white w-full sm:w-auto"
          >
            Reset Padrão
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="symbol-card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h2 className="brand-heading text-xl text-symbol-black mb-2">
            Resumo dos Cálculos
          </h2>
          <div className="w-8 h-px bg-symbol-beige"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-8">
          <div className="text-center">
            <div className="brand-heading text-3xl text-symbol-black mb-2">
              {paymentMethods.filter(m => m.isActive).length}
            </div>
            <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
              Formas Ativas
            </div>
          </div>
          <div className="text-center">
            <div className={`brand-heading text-3xl mb-2 ${
              Math.abs(totalDistribution - 100) > 0.01 
                ? 'text-red-600' 
                : 'text-symbol-black'
            }`}>
              {totalDistribution.toFixed(1)}%
            </div>
            <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
              Total Distribuição
            </div>
          </div>
          <div className="text-center">
            <div className="brand-heading text-3xl text-symbol-gold mb-2">
              {weightedAverageRate.toFixed(2)}%
            </div>
            <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
              Taxa Média Ponderada
            </div>
          </div>
          <div className="text-center">
            <div className="brand-heading text-3xl text-symbol-black mb-2">
              {workingDaysPerYear}
            </div>
            <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
              Dias Trabalhados/Ano
            </div>
          </div>
          <div className="text-center">
            <div className={`brand-heading text-3xl mb-2 ${
              Math.abs(totalMargins - 100) > 0.01 
                ? 'text-red-600' 
                : 'text-symbol-black'
            }`}>
              {totalMargins.toFixed(1)}%
            </div>
            <div className="brand-body text-symbol-gray-600 text-sm uppercase tracking-wide">
              Total Margens
            </div>
          </div>
        </div>
          {(Math.abs(totalDistribution - 100) > 0.01 || Math.abs(totalMargins - 100) > 0.01) && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200">
            <p className="text-yellow-700 brand-body text-sm">
              ⚠️ {Math.abs(totalDistribution - 100) > 0.01 && `A soma dos percentuais de distribuição é ${totalDistribution.toFixed(2)}% (recomendado: 100%).`}
              {Math.abs(totalDistribution - 100) > 0.01 && Math.abs(totalMargins - 100) > 0.01 && " "}
              {Math.abs(totalMargins - 100) > 0.01 && "A soma das margens deve ser igual a 100%."}
              {Math.abs(totalMargins - 100) > 0.01 ? " Ajuste as margens antes de salvar." : " Você pode continuar se os valores estão corretos."}
            </p>
          </div>
        )}
      </div>      {/* Save All Button */}      <div className="flex justify-center pt-6 sm:pt-8">
        <div className="text-center w-full max-w-md">
          <p className="text-sm text-symbol-gray-600 mb-4">
            Ou salve todas as configurações de uma vez:
          </p>          <Button 
            onClick={async () => {
              await handleSaveMargins();
              await handleSavePaymentMethods();
            }}
            disabled={isSaving}
            className="w-full bg-symbol-black hover:bg-symbol-gray-800 text-symbol-white font-light py-4 px-6 sm:px-8 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider text-sm disabled:opacity-50"
          >
            <Save size={20} />
            {isSaving ? 'Salvando...' : 'Salvar Todas as Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
