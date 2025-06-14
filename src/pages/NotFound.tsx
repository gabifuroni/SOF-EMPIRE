import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen yoni-gradient flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md mx-auto animate-minimal-fade">
        <div className="space-y-6">
          <h1 className="brand-heading text-6xl text-yoni-black">404</h1>
          <div className="w-16 h-px bg-yoni-gold mx-auto"></div>
          <h2 className="brand-heading text-2xl text-yoni-black">
            Página não encontrada
          </h2>
          <p className="brand-body text-yoni-gray-600">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full border-yoni-gray-300 text-yoni-gray-700 hover:bg-yoni-gray-50 font-light uppercase tracking-wide text-sm"
          >
            Voltar à página anterior
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="w-full bg-yoni-black hover:bg-yoni-gray-800 text-yoni-white font-light uppercase tracking-wide text-sm"
          >
            Ir para o início
          </Button>
        </div>

        <div className="pt-8">
          <p className="brand-body text-yoni-gray-400 text-xs uppercase tracking-widest">
            Sistema Premium para Profissionais da Beleza
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
