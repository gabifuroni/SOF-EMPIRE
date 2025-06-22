import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
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
  // Campos para dias da semana trabalhados
  trabalhaSegunda: boolean;
  trabalhaTerca: boolean;
  trabalhaQuarta: boolean;
  trabalhaQuinta: boolean;
  trabalhaSexta: boolean;
  trabalhaSabado: boolean;
  trabalhaDomingo: boolean;
  // Campo para feriados
  feriados: Array<{id: string, date: string, name: string}>;
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

  // Usar ref para manter referência estável da função
  const calculateWeightedAverageRateRef = useRef(dbCalculateWeightedAverageRate);
  calculateWeightedAverageRateRef.current = dbCalculateWeightedAverageRate;  const [params, setParams] = useState<BusinessParams>({
    lucroDesejado: 21.0,
    despesasIndiretasDepreciacao: 35.0,
    despesasDiretas: 44.0,
    impostosRate: 8.0,
    weightedAverageRate: 0,
    workingDaysPerYear: 240,
    attendanceGoal: 50,
    monthlyGoal: 10000,
    goalType: 'financial',
    paymentMethods: [],
    depreciacaoValorMobilizado: 160000,
    depreciacaoTotalMesDepreciado: 87000,
    depreciacaoMensal: 1450,
    equipeNumeroProfissionais: 2,
    // Valores padrão para dias da semana
    trabalhaSegunda: true,
    trabalhaTerca: true,
    trabalhaQuarta: true,
    trabalhaQuinta: true,
    trabalhaSexta: true,
    trabalhaSabado: false,
    trabalhaDomingo: false,
    // Feriados padrão
    feriados: [
      { id: '1', date: '2024-01-01', name: 'Confraternização Universal' },
      { id: '2', date: '2024-04-21', name: 'Tiradentes' },
      { id: '3', date: '2024-09-07', name: 'Independência do Brasil' }
    ],
  });  // Memoizar paymentMethods para evitar mudanças desnecessárias
  const memoizedPaymentMethods = useMemo(() => {
    if (!paymentMethodsLoading && dbPaymentMethods.length > 0) {
      const mappedMethods = dbPaymentMethods.map(pm => ({
        id: pm.id,
        name: pm.nome_metodo,
        isActive: pm.is_ativo,
        distributionPercentage: pm.percentual_distribuicao,
        taxRate: pm.taxa_percentual
      }));
      
      // Remove duplicates by name (case insensitive)
      const uniqueMethods = new Map<string, typeof mappedMethods[0]>();
      mappedMethods.forEach(method => {
        const key = method.name.toLowerCase().trim();
        if (!uniqueMethods.has(key) || (uniqueMethods.get(key)?.distributionPercentage || 0) < method.distributionPercentage) {
          uniqueMethods.set(key, method);
        }
      });
      
      return Array.from(uniqueMethods.values());
    }
    return [];
  }, [dbPaymentMethods, paymentMethodsLoading]);  // Memoizar configurações do negócio
  const memoizedBusinessSettings = useMemo(() => {
    if (!settingsLoading && businessSettings) {
      console.log('BusinessParamsContext - memoizedBusinessSettings:', businessSettings);
      return {
        lucroDesejado: businessSettings.lucroDesejado,
        despesasIndiretasDepreciacao: businessSettings.despesasIndiretasDepreciacao,
        impostosRate: businessSettings.taxaImpostos,
        weightedAverageRate: businessSettings.taxaMediaPonderada,
        workingDaysPerYear: businessSettings.diasTrabalhadosAno,
        depreciacaoValorMobilizado: businessSettings.depreciacaoValorMobilizado,
        depreciacaoTotalMesDepreciado: businessSettings.depreciacaoTotalMesDepreciado,
        depreciacaoMensal: businessSettings.depreciacaoMensal,
        equipeNumeroProfissionais: businessSettings.equipeNumeroProfissionais,
        // Novos campos
        trabalhaSegunda: businessSettings.trabalhaSegunda,
        trabalhaTerca: businessSettings.trabalhaTerca,
        trabalhaQuarta: businessSettings.trabalhaQuarta,
        trabalhaQuinta: businessSettings.trabalhaQuinta,
        trabalhaSexta: businessSettings.trabalhaSexta,
        trabalhaSabado: businessSettings.trabalhaSabado,
        trabalhaDomingo: businessSettings.trabalhaDomingo,
        feriados: businessSettings.feriados,
      };
    }
    return null;
  }, [businessSettings, settingsLoading]);

  // Memoizar metas do usuário
  const memoizedUserGoals = useMemo(() => {
    if (!goalsLoading && userGoals) {
      return {
        goalType: userGoals.tipoMeta === 'financeira' ? 'financial' as const : 'attendance' as const,
        monthlyGoal: userGoals.valorMetaMensal,
        attendanceGoal: userGoals.metaAtendimentosMensal || 50,
      };
    }
    return null;
  }, [userGoals, goalsLoading]);  // Atualizar params quando payment methods mudarem
  useEffect(() => {
    if (memoizedPaymentMethods.length > 0) {
      setParams(prev => ({
        ...prev,
        paymentMethods: memoizedPaymentMethods,
        weightedAverageRate: calculateWeightedAverageRateRef.current()
      }));
    }
  }, [memoizedPaymentMethods]);
  // Atualizar params quando business settings mudarem
  useEffect(() => {
    if (memoizedBusinessSettings) {
      console.log('BusinessParamsContext - Updating params with business settings:', memoizedBusinessSettings);
      setParams(prev => ({
        ...prev,
        ...memoizedBusinessSettings
      }));
    }
  }, [memoizedBusinessSettings]);

  // Atualizar params quando user goals mudarem
  useEffect(() => {
    if (memoizedUserGoals) {
      setParams(prev => ({
        ...prev,
        ...memoizedUserGoals
      }));
    }
  }, [memoizedUserGoals]);  const calculateWeightedAverageRate = useCallback(() => {
    if (dbPaymentMethods.length > 0) {
      return calculateWeightedAverageRateRef.current();
    }
    
    // Fallback para cálculo local se não há dados do banco
    // Usa os dados mais recentes diretamente do hook
    const activeMethods = dbPaymentMethods.filter(method => method.is_ativo);
    const totalDistribution = activeMethods.reduce((sum, method) => sum + method.percentual_distribuicao, 0);
    
    if (totalDistribution === 0) return 0;
    
    const weightedSum = activeMethods.reduce((sum, method) => 
      sum + (method.taxa_percentual * method.percentual_distribuicao), 0
    );
    
    return weightedSum / totalDistribution;
  }, [dbPaymentMethods]);
  const updateParams = useCallback((newParams: Partial<BusinessParams>) => {
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      // Recalculate weighted average rate if payment methods changed
      if (newParams.paymentMethods) {
        updated.weightedAverageRate = calculateWeightedAverageRate();
      }
      return updated;
    });
  }, [calculateWeightedAverageRate]);
  // Memoizar o valor do contexto para evitar recriações desnecessárias
  const value = useMemo(() => ({
    params,
    updateParams,
    calculateWeightedAverageRate,
    isLoading
  }), [params, updateParams, calculateWeightedAverageRate, isLoading]);

  return (
    <BusinessParamsContext.Provider value={value}>
      {children}
    </BusinessParamsContext.Provider>
  );
};
