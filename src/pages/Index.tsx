
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login/dashboard based on authentication
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen elite-gradient flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-elite-champagne-300 border-t-elite-champagne-600 rounded-full animate-spin mx-auto"></div>
        <p className="font-playfair text-elite-charcoal-700">Redirecionando...</p>
      </div>
    </div>
  );
};

export default Index;
