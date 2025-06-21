import { useEffect } from 'react';

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

interface BusinessParams {
  lucroDesejado?: number;
  despesasIndiretasDepreciacao?: number;
  impostosRate?: number;
  depreciacaoValorMobilizado?: number;
  depreciacaoTotalMesDepreciado?: number;
  equipeNumeroProfissionais?: number;
  trabalhaSegunda?: boolean;
  trabalhaTerca?: boolean;
  trabalhaQuarta?: boolean;
  trabalhaQuinta?: boolean;
  trabalhaSexta?: boolean;
  trabalhaSabado?: boolean;
  trabalhaDomingo?: boolean;
  feriados?: Holiday[];
}

export const useBusinessParamsInitialization = (
  params: BusinessParams | null,
  setLucroDesejado: (value: number) => void,
  setDespesasIndiretasDepreciacao: (value: number) => void,
  setImpostosRate: (value: number) => void,
  setValorMobilizado: (value: number) => void,
  setTotalDepreciado: (value: number) => void,
  setNumProfessionals: (value: number) => void,
  setWorkingDays: React.Dispatch<React.SetStateAction<WorkingDays>>,
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>
) => {
  useEffect(() => {
    if (params) {
      console.log('Initializing business parameters from context:', params);
      setLucroDesejado(params.lucroDesejado || 21.0);
      setDespesasIndiretasDepreciacao(params.despesasIndiretasDepreciacao || 35.0);
      setImpostosRate(params.impostosRate || 8.0);
      setValorMobilizado(params.depreciacaoValorMobilizado || 160000);
      setTotalDepreciado(params.depreciacaoTotalMesDepreciado || 87000);
      setNumProfessionals(params.equipeNumeroProfissionais || 2);
      
      if (params.trabalhaSegunda !== undefined) {
        setWorkingDays({
          segunda: params.trabalhaSegunda,
          terca: params.trabalhaTerca || false,
          quarta: params.trabalhaQuarta || false,
          quinta: params.trabalhaQuinta || false,
          sexta: params.trabalhaSexta || false,
          sabado: params.trabalhaSabado || false,
          domingo: params.trabalhaDomingo || false,
        });
      }
      
      if (params.feriados && params.feriados.length > 0) {
        setHolidays(params.feriados);
      }
    }
  }, [params, setLucroDesejado, setDespesasIndiretasDepreciacao, setImpostosRate, setValorMobilizado, setTotalDepreciado, setNumProfessionals, setWorkingDays, setHolidays]);
};
