import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useUserGoals } from '@/hooks/useUserGoals';

interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
  distributionPercentage: number;
  taxRate: number;
}

interface BusinessParams {
  lucroDesejado: number;
  despesasIndiretasDepreciacao: number;
  despesasDiretas: number;
  impostosRate: number;
  weightedAverageRate: number;
  workingDaysPerYear: number;
  attendanceGoal: number;
  monthlyGoal: number;
  goalType: 'financial' | 'attendance';
  paymentMethods: PaymentMethod[];
  // Novos campos dos parâmetros do negócio
  depreciacaoValorMobilizado: number;
  depreciacaoTotalMesDepreciado: number;
  depreciacaoMensal: number;
  equipeNumeroProfissionais: number;
}

interface BusinessParamsContextType {
  params: BusinessParams;
  updateParams: (newParams: Partial<BusinessParams>) => void;
  calculateWeightedAverageRate: () => number;
  isLoading: boolean;
}

const BusinessParamsContext = createContext<BusinessParamsContextType | undefined>(undefined);

export { BusinessParamsContext };

export const BusinessParamsProvider = ({ children }: { children: ReactNode }) => {
  const { paymentMethods: dbPaymentMethods, isLoading: paymentMethodsLoading, calculateWeightedAverageRate: dbCalculateWeightedAverageRate } = usePaymentMethods();
  const { settings: businessSettings, isLoading: settingsLoading } = useBusinessSettings();
  const { goals: userGoals, isLoading: goalsLoading } = useUserGoals();
  
  const isLoading = paymentMethodsLoading || settingsLoading || goalsLoading;

  const [params, setParams] = useState<BusinessParams>({
    lucroDesejado: 15.0,
    despesasIndiretasDepreciacao: 35.0,
    despesasDiretas: 50.0,
    impostosRate: 8.0,
    weightedAverageRate: 0,
    workingDaysPerYear: 240,
    attendanceGoal: 50,
    monthlyGoal: 10000,
    goalType: 'financial',
    paymentMethods: [],
    depreciacaoValorMobilizado: 100000,
    depreciacaoTotalMesDepreciado: 8700,
    depreciacaoMensal: 1450,
    equipeNumeroProfissionais: 1,
  });  // Sincronizar com dados do banco quando carregados
  useEffect(() => {
    if (!paymentMethodsLoading && dbPaymentMethods.length > 0) {
      const mappedPaymentMethods: PaymentMethod[] = dbPaymentMethods.map(pm => ({
        id: pm.id,
        name: pm.nome_metodo,
        isActive: pm.is_ativo,
        distributionPercentage: pm.prazo_recebimento_dias, // Usando como proxy para distribuição
        taxRate: pm.taxa_percentual
      }));

      setParams(prev => ({
        ...prev,
        paymentMethods: mappedPaymentMethods,
        weightedAverageRate: dbCalculateWeightedAverageRate()
      }));
    }
  }, [dbPaymentMethods, paymentMethodsLoading, dbCalculateWeightedAverageRate]);

  // Sincronizar com configurações do negócio
  useEffect(() => {
    if (!settingsLoading && businessSettings) {
      setParams(prev => ({
        ...prev,
        lucroDesejado: businessSettings.lucroDesejado,
        impostosRate: businessSettings.taxaImpostos,
        weightedAverageRate: businessSettings.taxaMediaPonderada,
        workingDaysPerYear: businessSettings.diasTrabalhadosAno,
        depreciacaoValorMobilizado: businessSettings.depreciacaoValorMobilizado,
        depreciacaoTotalMesDepreciado: businessSettings.depreciacaoTotalMesDepreciado,
        depreciacaoMensal: businessSettings.depreciacaoMensal,
        equipeNumeroProfissionais: businessSettings.equipeNumeroProfissionais,
      }));
    }
  }, [businessSettings, settingsLoading]);

  // Sincronizar com metas do usuário
  useEffect(() => {
    if (!goalsLoading && userGoals) {
      setParams(prev => ({
        ...prev,
        goalType: userGoals.tipoMeta === 'financeira' ? 'financial' : 'attendance',
        monthlyGoal: userGoals.valorMetaMensal,
        attendanceGoal: userGoals.metaAtendimentosMensal || 50,
      }));
    }
  }, [userGoals, goalsLoading]);

  const calculateWeightedAverageRate = useCallback(() => {
    if (dbPaymentMethods.length > 0) {
      return dbCalculateWeightedAverageRate();
    }
    
    // Fallback para cálculo local se não há dados do banco
    const activeMethods = params.paymentMethods.filter(method => method.isActive);
    const totalDistribution = activeMethods.reduce((sum, method) => sum + method.distributionPercentage, 0);
    
    if (totalDistribution === 0) return 0;
    
    const weightedSum = activeMethods.reduce((sum, method) => 
      sum + (method.taxRate * method.distributionPercentage), 0
    );
    
    return weightedSum / totalDistribution;
  }, [params.paymentMethods, dbPaymentMethods, dbCalculateWeightedAverageRate]);

  const updateParams = (newParams: Partial<BusinessParams>) => {
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      // Recalculate weighted average rate if payment methods changed
      if (newParams.paymentMethods) {
        updated.weightedAverageRate = calculateWeightedAverageRate();
      }
      return updated;
    });
  };

  // Remove the useEffect that was causing infinite loop - the calculation is already handled above
  const value = {
    params,
    updateParams,
    calculateWeightedAverageRate,
    isLoading
  };

  return (
    <BusinessParamsContext.Provider value={value}>
      {children}
    </BusinessParamsContext.Provider>
  );
};
