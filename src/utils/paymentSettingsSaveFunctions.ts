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

interface WorkingDays {
  segunda: boolean;
  terca: boolean;
  quarta: boolean;
  quinta: boolean;
  sexta: boolean;
  sabado: boolean;
  domingo: boolean;
}

interface DbPaymentMethod {
  id: string;
  nome_metodo: string;
  is_ativo: boolean;
  prazo_recebimento_dias: number;
  taxa_percentual: number;
}

interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

interface Toast {
  (props: ToastProps): void;
}

interface SaveSettingsParams {
  lucroDesejado: number;
  taxaImpostos: number;
  taxaMediaPonderada: number;
  depreciacaoValorMobilizado: number;
  depreciacaoTotalMesDepreciado: number;
  depreciacaoMensal: number;
  diasTrabalhadosAno: number;
  equipeNumeroProfissionais: number;
  trabalhaSegunda?: boolean;
  trabalhaTerca?: boolean;
  trabalhaQuarta?: boolean;
  trabalhaQuinta?: boolean;
  trabalhaSexta?: boolean;
  trabalhaSabado?: boolean;
  trabalhaDomingo?: boolean;
  feriados?: Holiday[];
}

interface SaveSettings {
  mutateAsync: (params: SaveSettingsParams) => Promise<unknown>;
}

interface UpdateDbPaymentMethodParams {
  id: string;
  nome_metodo: string;
  is_ativo: boolean;
  prazo_recebimento_dias: number;
  taxa_percentual: number;
}

interface UpdateDbPaymentMethod {
  mutateAsync: (params: UpdateDbPaymentMethodParams) => Promise<unknown>;
}

interface BusinessParams {
  lucroDesejado?: number;
  despesasIndiretasDepreciacao?: number;
  despesasDiretas?: number;
  impostosRate?: number;
  depreciacaoValorMobilizado?: number;
  depreciacaoTotalMesDepreciado?: number;
  depreciacaoMensal?: number;
  equipeNumeroProfissionais?: number;
  workingDaysPerYear?: number;
  trabalhaSegunda?: boolean;
  trabalhaTerca?: boolean;
  trabalhaQuarta?: boolean;
  trabalhaQuinta?: boolean;
  trabalhaSexta?: boolean;
  trabalhaSabado?: boolean;
  trabalhaDomingo?: boolean;
  feriados?: Holiday[];
  paymentMethods?: PaymentMethod[];
  weightedAverageRate?: number;
}

interface SaveFunctionsProps {
  toast: Toast;
  saveSettings: SaveSettings;
  updateParams: (params: BusinessParams) => void;
  paymentMethods: PaymentMethod[];
  dbPaymentMethods: DbPaymentMethod[];
  updateDbPaymentMethod: UpdateDbPaymentMethod;
  setIsSaving: (value: boolean) => void;
  calculateWeightedAverageRate: () => number;
  calculateWorkingDaysPerYear: () => number;
  getTotalDistribution: () => number;
}

export const createSaveFunctions = ({
  toast,
  saveSettings,
  updateParams,
  paymentMethods,
  dbPaymentMethods,
  updateDbPaymentMethod,
  setIsSaving,
  calculateWeightedAverageRate,
  calculateWorkingDaysPerYear,
  getTotalDistribution
}: SaveFunctionsProps) => {
  
  const handleSaveMargins = async (
    lucroDesejado: number,
    despesasIndiretasDepreciacao: number,
    despesasDiretas: number,
    impostosRate: number,
    valorMobilizado: number,
    totalDepreciado: number,
    depreciacaoMensal: number,
    numProfessionals: number
  ) => {
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
      });
    } catch (error) {
      console.error('Error saving margins:', error);
      
      let errorMessage = "Erro ao salvar configurações de margens. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('23505') || error.message.includes('duplicate')) {
          errorMessage = "Erro: Dados duplicados detectados. Tentando atualizar os dados existentes...";
          
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

  const handleSaveDepreciation = async (
    lucroDesejado: number,
    impostosRate: number,
    valorMobilizado: number,
    totalDepreciado: number,
    depreciacaoMensal: number,
    numProfessionals: number
  ) => {
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
  const handleSaveWorkingDays = async (
    lucroDesejado: number,
    impostosRate: number,
    valorMobilizado: number,
    totalDepreciado: number,
    depreciacaoMensal: number,
    numProfessionals: number,
    workingDays: WorkingDays,
    holidays: Holiday[]
  ) => {
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
        trabalhaSegunda: workingDays.segunda,
        trabalhaTerca: workingDays.terca,
        trabalhaQuarta: workingDays.quarta,
        trabalhaQuinta: workingDays.quinta,
        trabalhaSexta: workingDays.sexta,
        trabalhaSabado: workingDays.sabado,
        trabalhaDomingo: workingDays.domingo,
        feriados: holidays,
      });

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

  const handleSavePaymentMethods = async () => {
    setIsSaving(true);
    
    try {
      console.log('Salvando métodos de pagamento:', paymentMethods);

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
  const handleSaveTeam = async (
    lucroDesejado: number,
    impostosRate: number,
    valorMobilizado: number,
    totalDepreciado: number,
    depreciacaoMensal: number,
    numProfessionals: number,
    workingDays: WorkingDays,
    holidays: Holiday[]
  ) => {
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
        trabalhaSegunda: workingDays.segunda,
        trabalhaTerca: workingDays.terca,
        trabalhaQuarta: workingDays.quarta,
        trabalhaQuinta: workingDays.quinta,
        trabalhaSexta: workingDays.sexta,
        trabalhaSabado: workingDays.sabado,
        trabalhaDomingo: workingDays.domingo,
        feriados: holidays,
      });

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

  return {
    handleSaveMargins,
    handleSaveDepreciation,
    handleSaveWorkingDays,
    handleSavePaymentMethods,
    handleSaveTeam
  };
};
