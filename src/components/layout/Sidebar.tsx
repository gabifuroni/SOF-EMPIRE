
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  User, 
  Search,
  FileText,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Package,
  TrendingUp,
  Receipt,
  BarChart3,
  Settings
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
        { icon: DollarSign, label: 'Fluxo de Caixa Diário', href: '/daily-cash-flow' }
      ]
    },
    {
      section: 'Gestão',
      items: [
        { icon: Scissors, label: 'Serviços & Preços', href: '/services' },
        { icon: Package, label: 'Matéria-Prima', href: '/materials' },
        { icon: TrendingUp, label: 'Fluxo de Caixa', href: '/cash-flow' },
        { icon: Receipt, label: 'Despesas', href: '/expenses' },
        { icon: BarChart3, label: 'Relatório Mensal', href: '/reports' }
      ]
    },
    {
      section: 'Configurações',
      items: [
        { icon: User, label: 'Perfil', href: '/profile' },
        { icon: Settings, label: 'Parâmetros do Negócio', href: '/payment-settings' }
      ]
    }
  ];

  const adminMenuItems = [
    {
      section: 'Administração',
      items: [
        { icon: Home, label: 'Painel Admin', href: '/admin' },
        { icon: User, label: 'Usuários', href: '/admin/users' }
      ]
    }
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : professionalMenuItems;
  const handleLinkClick = () => {
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  console.log('Sidebar render - isMobileMenuOpen:', isMobileMenuOpen);

  return (
    <>      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[50] transition-opacity duration-300"
          onClick={onCloseMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex symbol-sidebar text-symbol-white transition-all duration-300 ease-in-out flex-col relative",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Header */}
        <div className={cn(
          "p-6 border-b border-symbol-gray-800 transition-all duration-300",
          collapsed ? "p-4" : "p-6"
        )}>
          <div className="flex items-center justify-between">
            {!collapsed ? (
              <div className="text-center flex-1">
                {/* Geometric Symbol */}
                <div className="mb-2 flex justify-center">
                  <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="Geometric Symbol" className="w-12 transition-all duration-300" />
                </div>
                <div className="w-8 h-px bg-symbol-gold mx-auto"></div>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="Geometric Symbol" className="w-8 transition-all duration-300" />
              </div>
            )}
            
            {/* Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "p-2 rounded-lg hover:bg-symbol-gray-700 transition-all duration-300 group",
                collapsed ? "absolute -right-3 top-6 bg-symbol-gray-800 shadow-lg border border-symbol-gray-600" : ""
              )}
            >
              {collapsed ? (
                <ChevronRight size={16} className="text-symbol-gold group-hover:text-symbol-white" />
              ) : (
                <ChevronLeft size={16} className="text-symbol-gray-400 group-hover:text-symbol-white" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-2 overflow-y-auto transition-all duration-300",
          collapsed ? "p-2" : "p-4 space-y-8"
        )}>
          {menuItems.map((section, sectionIndex) => (
            <div key={section.section}>
              {!collapsed && (
                <h3 className="brand-subheading text-symbol-gray-400 text-xs uppercase tracking-widest mb-4">
                  {section.section}
                </h3>
              )}
              
              {/* Section Separator for collapsed state */}
              {collapsed && sectionIndex > 0 && (
                <div className="my-4 mx-2 h-px bg-symbol-gray-800"></div>
              )}
              
              <ul className={cn(
                "transition-all duration-300",
                collapsed ? "space-y-2" : "space-y-1"
              )}>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href} className="relative group">
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center transition-all duration-200 brand-body relative",
                          collapsed 
                            ? "justify-center p-3 rounded-xl mx-1" 
                            : "gap-3 px-3 py-3",
                          isActive 
                            ? collapsed 
                              ? "bg-symbol-gold text-symbol-black shadow-lg" 
                              : "bg-symbol-gold/10 text-symbol-gold border-r-2 border-symbol-gold"
                            : collapsed
                              ? "text-symbol-gray-300 hover:bg-symbol-gray-700 hover:text-symbol-white"
                              : "text-symbol-gray-300 hover:bg-symbol-gray-800 hover:text-symbol-white"
                        )}
                      >
                        <item.icon size={18} className={cn(
                          "transition-all duration-200",
                          collapsed && isActive ? "text-symbol-black" : ""
                        )} />
                        {!collapsed && (
                          <span className="font-light text-sm">{item.label}</span>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                          <div className="absolute left-full ml-3 px-3 py-2 bg-symbol-black text-symbol-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-symbol-gray-700">
                            {item.label}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-symbol-black rotate-45 border-l border-b border-symbol-gray-700"></div>
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-symbol-gray-800 transition-all duration-300",
          collapsed ? "p-2" : "p-4"
        )}>
          <div className="text-center text-symbol-gray-500 text-xs">
            {!collapsed ? (
              <>
                <p className="brand-body uppercase tracking-widest">Sistema Premium</p>
                <div className="w-4 h-px bg-symbol-gray-700 mx-auto mt-2"></div>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="w-6 h-px bg-symbol-gray-700"></div>
              </div>
            )}
          </div>
        </div>
      </div>      {/* Mobile Sidebar - unchanged */}
      <div 
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-[60] w-80 symbol-sidebar text-symbol-white transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ 
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          visibility: 'visible',
          display: 'block'
        }}
      >
        {/* Mobile Header */}
        <div className="p-4 border-b border-symbol-gray-800 flex items-center justify-between">
          <div className="text-center">
            {/* Geometric Symbol */}
            <div className="mb-1 flex justify-center">
              <img src="/lovable-uploads/2c89b6d0-0654-4a70-9721-8febacad65fd.png" alt="Geometric Symbol" className="w-8 transition-all duration-300" />
            </div>
            <div className="w-8 h-px bg-symbol-gold mx-auto"></div>
          </div>
          <button
            onClick={onCloseMobileMenu}
            className="p-2 rounded-sm hover:bg-symbol-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
          {menuItems.map((section) => (
            <div key={section.section}>
              <h3 className="brand-subheading text-symbol-gray-400 text-xs uppercase tracking-widest mb-4">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-4 transition-all duration-200 brand-body",
                          isActive 
                            ? "bg-symbol-gold/10 text-symbol-gold border-r-2 border-symbol-gold" 
                            : "text-symbol-gray-300 hover:bg-symbol-gray-800 hover:text-symbol-white"
                        )}
                      >
                        <item.icon size={18} />
                        <span className="font-light text-sm">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Mobile Footer */}
        <div className="p-4 border-t border-symbol-gray-800">
          <div className="text-center text-symbol-gray-500 text-xs">
            <p className="brand-body uppercase tracking-widest">Sistema Premium</p>
            <div className="w-4 h-px bg-symbol-gray-700 mx-auto mt-2"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
