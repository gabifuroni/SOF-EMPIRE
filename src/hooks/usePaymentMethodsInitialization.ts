import { useEffect } from 'react';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  isActive: boolean;
  distributionPercentage: number;
  taxRate: number;
}

interface DbPaymentMethod {
  id: string;
  nome_metodo: string;
  is_ativo: boolean;
  prazo_recebimento_dias: number;
  taxa_percentual: number;
}

export const usePaymentMethodsInitialization = (
  dbPaymentMethods: DbPaymentMethod[] | undefined,
  isInitialized: boolean,
  paymentMethods: PaymentMethod[],
  setPaymentMethods: (methods: PaymentMethod[]) => void,
  setIsInitialized: (value: boolean) => void,
  getDefaultPaymentMethods: () => PaymentMethod[],
  removeDuplicatePaymentMethods: (methods: PaymentMethod[]) => PaymentMethod[]
) => {
  useEffect(() => {
    console.log('PaymentSettings initialization:', {
      isInitialized,
      dbPaymentMethodsLength: dbPaymentMethods?.length || 0,
      paymentMethodsLength: paymentMethods.length
    });

    if (!isInitialized) {
      if (dbPaymentMethods && dbPaymentMethods.length > 0) {
        console.log('Initializing from database:', dbPaymentMethods);
        const mappedMethods = dbPaymentMethods.map(pm => ({
          id: pm.id,
          name: pm.nome_metodo,
          icon: pm.nome_metodo.toLowerCase().includes('crédito') || pm.nome_metodo.toLowerCase().includes('credit') ? CreditCard : 
               pm.nome_metodo.toLowerCase().includes('débito') || pm.nome_metodo.toLowerCase().includes('debit') ? CreditCard :
               pm.nome_metodo.toLowerCase().includes('pix') ? Smartphone : Banknote,
          isActive: pm.is_ativo,
          distributionPercentage: Math.max(0, Math.min(100, pm.prazo_recebimento_dias || 0)),
          taxRate: pm.taxa_percentual || 0
        }));

        console.log('Mapped methods:', mappedMethods);
        const uniqueMethods = removeDuplicatePaymentMethods(mappedMethods);
        console.log('Unique methods after deduplication:', uniqueMethods);
        setPaymentMethods(uniqueMethods);
        setIsInitialized(true);
      } else if (paymentMethods.length === 0) {
        console.log('Using default payment methods');
        setPaymentMethods(getDefaultPaymentMethods());
        setIsInitialized(true);
      }
    }
  }, [dbPaymentMethods, isInitialized, paymentMethods.length, getDefaultPaymentMethods, removeDuplicatePaymentMethods, setIsInitialized, setPaymentMethods]);
};
