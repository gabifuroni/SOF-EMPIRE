import { useContext } from 'react';
import { BusinessParamsContext } from '../contexts/BusinessParamsContext';

export const useBusinessParams = () => {
  const context = useContext(BusinessParamsContext);
  if (!context) {
    throw new Error('useBusinessParams must be used within a BusinessParamsProvider');
  }
  return context;
};
