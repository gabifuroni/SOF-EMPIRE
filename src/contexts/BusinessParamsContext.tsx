import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

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
  const { paymentMethods: dbPaymentMethods, isLoading, calculateWeightedAverageRate: dbCalculateWeightedAverageRate } = usePaymentMethods();  const [params, setParams] = useState<BusinessParams>({
    lucroDesejado: 15.0,
    despesasIndiretasDepreciacao: 35.0,
    despesasDiretas: 50.0,
    impostosRate: 8.0,
    weightedAverageRate: 0,
    workingDaysPerYear: 240,
    attendanceGoal: 50,
    monthlyGoal: 10000,
    goalType: 'financial',
    paymentMethods: []
  });

  // Sincronizar com dados do banco quando carregados
  useEffect(() => {
    if (!isLoading && dbPaymentMethods.length > 0) {
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
  }, [dbPaymentMethods, isLoading, dbCalculateWeightedAverageRate]);

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
  useEffect(() => {
    // Calculate initial weighted average rate
    setParams(prev => ({
      ...prev,
      weightedAverageRate: calculateWeightedAverageRate()
    }));
  }, [calculateWeightedAverageRate]);
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
