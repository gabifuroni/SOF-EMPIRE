import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, DollarSign, User, Package, Scissors,
  TrendingUp, Receipt, BarChart3, Settings,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole: 'admin' | 'professional';
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

const Sidebar = ({ userRole, isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const professionalMenuItems = [
    {
      section: 'Principal',
      items: [
        { icon: Home, label: 'Painel Principal', href: '/dashboard' },
        { icon: DollarSign, label: 'Fluxo de Caixa Diário', href: '/daily-cash-flow' },
      ],
    },
    {
      section: 'Gestão',
      items: [
        { icon: Package, label: 'Matéria-Prima', href: '/materials' },
        { icon: Scissors, label: 'Serviços & Preços', href: '/services' },
        { icon: TrendingUp, label: 'Fluxo de Caixa', href: '/cash-flow' },
        { icon: Receipt, label: 'Despesas', href: '/expenses' },
        { icon: BarChart3, label: 'Relatório Mensal', href: '/reports' },
      ],
    },
    {
      section: 'Configurações',
      items: [
        { icon: User, label: 'Perfil', href: '/profile' },
        { icon: Settings, label: 'Parâmetros do Negócio', href: '/payment-settings' },
      ],
    },
  ];

  const adminMenuItems = [
    {
      section: 'Administração',
      items: [
        { icon: Home, label: 'Painel Admin', href: '/admin' },
        { icon: User, label: 'Usuários', href: '/admin/users' },
      ],
    },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : professionalMenuItems;

  const handleLinkClick = () => {
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const sidebarStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #0d0d14 0%, #13131a 100%)',
    borderRight: '1px solid #2a2a38',
  };

  const NavItem = ({ item, isCollapsed }: { item: typeof professionalMenuItems[0]['items'][0], isCollapsed: boolean }) => {
    const isActive = location.pathname === item.href;
    return (
      <li className="relative group">
        <Link
          to={item.href}
          onClick={handleLinkClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isCollapsed ? 0 : 10,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '10px' : '10px 12px',
            borderRadius: 8,
            marginBottom: 2,
            transition: 'all 0.15s',
            background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
            color: isActive ? '#c9a84c' : '#9090a8',
            border: isActive ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: isActive ? 500 : 400,
            position: 'relative',
          }}
          className="sidebar-nav-item"
        >
          <item.icon size={16} style={{ flexShrink: 0, color: isActive ? '#c9a84c' : '#9090a8' }} />
          {!isCollapsed && <span>{item.label}</span>}
          {isCollapsed && (
            <div style={{
              position: 'absolute', left: '100%', marginLeft: 10,
              background: '#1c1c26', color: '#f0f0f8', fontSize: 12,
              padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap',
              border: '1px solid #2a2a38', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              opacity: 0, pointerEvents: 'none', zIndex: 100,
            }} className="sidebar-tooltip">
              {item.label}
            </div>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      <style>{`
        .sidebar-nav-item:hover { background: rgba(255,255,255,0.05) !important; color: #f0f0f8 !important; }
        .sidebar-nav-item:hover svg { color: #f0f0f8 !important; }
        .sidebar-nav-item:hover .sidebar-tooltip { opacity: 1 !important; pointer-events: auto !important; }
      `}</style>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[50]"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      <div
        className={cn('hidden lg:flex flex-col transition-all duration-300 relative flex-shrink-0', collapsed ? 'w-[72px]' : 'w-[240px]')}
        style={sidebarStyle}
      >
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 12px' : '20px 16px', borderBottom: '1px solid #2a2a38', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #c9a84c, #8a6520)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="SOF" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f8', letterSpacing: '0.04em', fontFamily: 'Sora, sans-serif' }}>SOF Empire</div>
                <div style={{ fontSize: 10, color: '#9090a8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Financeiro</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #c9a84c, #8a6520)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="SOF" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a38', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#9090a8', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              position: 'absolute', right: -12, top: 24,
              width: 24, height: 24, borderRadius: '50%',
              background: '#1c1c26', border: '1px solid #2a2a38',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#9090a8', zIndex: 10,
            }}
          >
            <ChevronRight size={12} />
          </button>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '16px 10px' : '16px 12px', overflowY: 'auto' }}>
          {menuItems.map((section, i) => (
            <div key={section.section} style={{ marginBottom: 24 }}>
              {!collapsed && (
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#606078', marginBottom: 8, paddingLeft: 12 }}>
                  {section.section}
                </div>
              )}
              {collapsed && i > 0 && <div style={{ height: 1, background: '#2a2a38', margin: '12px 4px' }} />}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.items.map(item => <NavItem key={item.href} item={item} isCollapsed={collapsed} />)}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: collapsed ? '12px' : '12px 16px', borderTop: '1px solid #2a2a38' }}>
          <div style={{ fontSize: 10, color: '#606078', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {!collapsed ? 'Sistema Premium' : '·'}
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      <div
        className="lg:hidden fixed inset-y-0 left-0 z-[60] w-80 flex flex-col"
        style={{
          ...sidebarStyle,
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a38', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #c9a84c, #8a6520)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="SOF" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f8', fontFamily: 'Sora, sans-serif' }}>SOF Empire</div>
          </div>
          <button onClick={onCloseMobileMenu} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a38', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#9090a8', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {menuItems.map((section) => (
            <div key={section.section} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#606078', marginBottom: 8, paddingLeft: 12 }}>
                {section.section}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.items.map(item => <NavItem key={item.href} item={item} isCollapsed={false} />)}
              </ul>
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2a38', textAlign: 'center', fontSize: 10, color: '#606078', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Sistema Premium
        </div>
      </div>
    </>
  );
};

export default Sidebar;
