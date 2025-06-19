
import { User, LogOut, Menu } from 'lucide-react';
import { User as UserType, PATENTE_LEVELS } from '@/types';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
}

const Header = ({ user, onLogout, onToggleMobileMenu }: HeaderProps) => {
  const { profile } = useProfile();
  
  const getCurrentPatente = (revenue: number) => {
    const sortedPatentes = [...PATENTE_LEVELS].sort((a, b) => b.minRevenue - a.minRevenue);
    return sortedPatentes.find(p => revenue >= p.minRevenue) || PATENTE_LEVELS[0];
  };

  const currentPatente = user.role === 'professional' && user.monthlyRevenue 
    ? getCurrentPatente(user.monthlyRevenue) 
    : null;

  // Extract first and last name from full name
  const getFirstAndLastName = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0];
    return `${names[0]} ${names[names.length - 1]}`;
  };

  const fullName = profile?.nome_profissional_ou_salao || user.name;
  const displayName = getFirstAndLastName(fullName);
  
  // Extract salon name from endereco field
  const salonName = profile?.nome_salao || '';

  return (
    <header className="bg-symbol-white/80 backdrop-blur-sm border-b border-symbol-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-symbol-gray-100 hover:bg-symbol-gray-200 transition-colors"
          >
            <Menu size={20} className="text-symbol-gray-700" />
          </button>

          {/* Title and Patente */}
          <div className="flex items-center gap-4">
            <h2 className="brand-heading text-xl sm:text-2xl text-symbol-black">
              {user.role === 'professional' ? 'Painel Profissional' : 'Painel Administrativo'}
            </h2>
            
            {currentPatente && (
              <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200">
                <span className="text-base sm:text-lg">{currentPatente.icon}</span>
                <span className="brand-body text-symbol-gray-700 text-sm sm:text-base">
                  {currentPatente.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Info - Hidden on very small screens */}
          <div className="hidden sm:block text-right">
            <p className="brand-body text-symbol-black text-sm sm:text-base">{displayName}</p>
            {salonName && (
              <p className="text-xs sm:text-sm text-symbol-gray-600">{salonName}</p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 rounded-lg bg-symbol-gray-100 hover:bg-symbol-gray-200 transition-colors">
              <User size={18} className="text-symbol-gray-700 sm:w-5 sm:h-5" />
            </button>
            
            <button 
              onClick={onLogout}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            >
              <LogOut size={18} className="text-red-600 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Patente Display */}
      {currentPatente && (
        <div className="sm:hidden mt-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200 w-fit">
          <span className="text-base">{currentPatente.icon}</span>
          <span className="brand-body text-symbol-gray-700 text-sm">
            {currentPatente.name}
          </span>
        </div>
      )}

      {/* Mobile User Info */}
      <div className="sm:hidden mt-2 text-left">
        <p className="font-medium text-elite-charcoal-800 text-sm">{displayName}</p>
        {salonName && (
          <p className="text-xs text-elite-charcoal-600">{salonName}</p>
        )}
      </div>
    </header>
  );
};

export default Header;
