import React from 'react';
import { useAuthMonitor } from '@/hooks/useAuthMonitor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { isTokenExpiring } = useAuthMonitor();

  return (
    <>
      {isTokenExpiring && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Alert className="border-orange-200 bg-orange-50 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <AlertDescription className="text-orange-800 font-medium">
              <strong>Atenção:</strong> Sua sessão expirará em breve. Salve seu trabalho!
            </AlertDescription>
          </Alert>
        </div>
      )}
      {children}
    </>
  );
};

export default AuthWrapper;
