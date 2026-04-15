import { User, LogOut, Menu, Bell } from 'lucide-react';
import { User as UserType, PATENTE_LEVELS } from '@/types';
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

  const getFirstAndLastName = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0];
    return `${names[0]} ${names[names.length - 1]}`;
  };

  const fullName = profile?.nome_profissional_ou_salao || user.name;
  const displayName = getFirstAndLastName(fullName);
  const salonName = profile?.nome_salao || '';

  return (
    <header style={{
      background: '#13131a',
      borderBottom: '1px solid #2a2a38',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      flexShrink: 0,
    }}>
      <style>{`
        .header-icon-btn { background: rgba(255,255,255,0.05); border: 1px solid #2a2a38; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #9090a8; }
        .header-icon-btn:hover { background: rgba(255,255,255,0.1); border-color: #3a3a4a; color: #f0f0f8; }
        .header-logout-btn { background: rgba(255,77,106,0.08); border: 1px solid rgba(255,77,106,0.2); border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; color: #ff4d6a; }
        .header-logout-btn:hover { background: rgba(255,77,106,0.15); }
      `}</style>

      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Mobile menu button */}
        <button className="header-icon-btn lg:hidden" onClick={onToggleMobileMenu}>
          <Menu size={18} />
        </button>

        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f8', fontFamily: 'serif', letterSpacing: '0.02em' }}>
            {user.role === 'professional' ? 'Painel Profissional' : 'Painel Administrativo'}
          </div>
          {currentPatente && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: 12 }}>{currentPatente.icon}</span>
              <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 500 }}>{currentPatente.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* User info */}
        <div style={{ textAlign: 'right', display: 'none' }} className="sm:block" >
          <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f8' }}>{displayName}</div>
          {salonName && <div style={{ fontSize: 11, color: '#9090a8' }}>{salonName}</div>}
        </div>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #c9a84c, #8a6520)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#0a0a0f', flexShrink: 0,
        }}>
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div style={{ width: 1, height: 24, background: '#2a2a38' }} />

        <button className="header-icon-btn">
          <Bell size={16} />
        </button>

        <button className="header-logout-btn" onClick={onLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
