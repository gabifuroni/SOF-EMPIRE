import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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
}

const BusinessParamsContext = createContext<BusinessParamsContextType | undefined>(undefined);

export { BusinessParamsContext };

export const BusinessParamsProvider = ({ children }: { children: ReactNode }) => {  const [params, setParams] = useState<BusinessParams>({
    lucroDesejado: 15.0,
    despesasIndiretasDepreciacao: 35.0,
    despesasDiretas: 50.0,
    impostosRate: 8.0,
    weightedAverageRate: 0,
    workingDaysPerYear: 240,
    attendanceGoal: 50,
    monthlyGoal: 10000,
    goalType: 'financial',
    paymentMethods: [
      {
        id: 'credit',
        name: 'Crédito',
        isActive: true,
        distributionPercentage: 50.0,
        taxRate: 3.20
      },
      {
        id: 'credit_installment',
        name: 'Crédito Parcelado',
        isActive: true,
        distributionPercentage: 5.0,
        taxRate: 6.34
      },
      {
        id: 'debit',
        name: 'Débito',
        isActive: true,
        distributionPercentage: 15.0,
        taxRate: 1.39
      },
      {
        id: 'cash',
        name: 'Dinheiro/Cheque',
        isActive: true,
        distributionPercentage: 30.0,
        taxRate: 0.00
      }
    ]
  });
  const calculateWeightedAverageRate = useCallback(() => {
    const activeMethods = params.paymentMethods.filter(method => method.isActive);
    const totalDistribution = activeMethods.reduce((sum, method) => sum + method.distributionPercentage, 0);
    
    if (totalDistribution === 0) return 0;
    
    const weightedSum = activeMethods.reduce((sum, method) => 
      sum + (method.taxRate * method.distributionPercentage), 0
    );
    
    return weightedSum / totalDistribution;
  }, [params.paymentMethods]);

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
    calculateWeightedAverageRate
  };

  return (
    <BusinessParamsContext.Provider value={value}>
      {children}
    </BusinessParamsContext.Provider>
  );
};
