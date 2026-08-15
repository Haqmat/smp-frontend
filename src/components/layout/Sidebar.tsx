import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  House, 
  Package, 
  ShoppingCart, 
  Wallet, 
  ChartBar, 
  Users, 
  Sun,
  Moon,
  SignOut,
  X,
  CaretDown,
  CaretUp,
  ListPlus,
  Clock,
  Warehouse,
  Plus,
  Receipt,
  Coin,
  FileText,
  UserGear,
  Sliders,
  User
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavGroup {
  name: string;
  icon: React.FC<{ className?: string; size?: number }>;
  roles?: string[];
  items: {
    name: string;
    path: string;
    icon?: React.FC<{ className?: string; size?: number }>;
    roles?: string[];
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Keep track of collapsed navigation groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Inventory: true,
    Sales: true,
    Expenses: true,
    Reports: true,
    Admin: true,
  });

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const navigationGroups: NavGroup[] = [
    {
      name: 'Inventory',
      icon: Package,
      items: [
        { name: 'Grain Intake', path: '/inventory/grain-intake', icon: ListPlus },
        { name: 'Milling Tracker', path: '/inventory/milling', icon: Clock },
        { name: 'Stock Levels', path: '/inventory/stock-levels', icon: Warehouse },
      ]
    },
    {
      name: 'Sales',
      icon: ShoppingCart,
      items: [
        { name: 'New Sale (POS)', path: '/sales/new', icon: Plus },
        { name: 'Sales History', path: '/sales', icon: Receipt },
      ]
    },
    {
      name: 'Expenses',
      icon: Wallet,
      items: [
        { name: 'Record Expense', path: '/expenses/new', icon: Plus },
        { name: 'Expenses List', path: '/expenses', icon: Coin },
      ]
    },
    {
      name: 'Reports',
      icon: ChartBar,
      roles: ['ADMIN', 'MANAGER', 'AUDITOR'],
      items: [
        { name: 'Annual Sales', path: '/reports/annual-sales', icon: FileText },
        { name: 'Profit & Loss', path: '/reports/profit-loss', icon: FileText },
      ]
    },
    {
      name: 'Admin',
      icon: UserGear,
      roles: ['ADMIN'],
      items: [
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'System Config', path: '/admin/config', icon: Sliders },
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Filter groups and items by user roles
  const filteredGroups = navigationGroups.filter(group => {
    if (group.roles && (!user || !group.roles.includes(user.role))) return false;
    return true;
  }).map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (item.roles && (!user || !item.roles.includes(user.role))) return false;
      return true;
    })
  }));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground
        border-r border-sidebar-border
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavigation('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-[#a38413] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                H
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#a38413] leading-tight">Haqmat</h1>
                <p className="text-xs text-muted-foreground">Sales Management</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-accent rounded-xl text-muted-foreground transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Container - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            {/* Dashboard Direct Button */}
            <button
              onClick={() => handleNavigation('/dashboard')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-[#a38413]/15 text-[#a38413] font-bold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent transition-colors'
              }`}
            >
              <House size={20} />
              <span className="font-semibold">Dashboard</span>
              {isActive('/dashboard') && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#a38413]" />
              )}
            </button>

            {/* Grouped items */}
            {filteredGroups.map((group) => {
              const isGroupOpen = openGroups[group.name];
              return (
                <div key={group.name} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <group.icon size={16} />
                      {group.name}
                    </span>
                    {isGroupOpen ? <CaretUp size={14} /> : <CaretDown size={14} />}
                  </button>

                  {isGroupOpen && (
                    <div className="space-y-1 pl-3 border-l-2 border-sidebar-border ml-4">
                      {group.items.map((item) => {
                        const active = isActive(item.path);
                        const ItemIcon = item.icon || group.icon;
                        return (
                          <button
                            key={item.name}
                            onClick={() => handleNavigation(item.path)}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                              active
                                ? 'bg-[#a38413]/15 text-[#a38413] font-bold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                            }`}
                          >
                            <ItemIcon size={18} />
                            <span>{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Fixed Footer - User Profile & Sign Out Always at Bottom */}
          <div className="p-3 border-t border-sidebar-border flex-shrink-0 bg-sidebar space-y-2.5">
            {/* User Details Box */}
            <div 
              onClick={() => handleNavigation('/profile')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent cursor-pointer transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#a38413] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {user?.full_name ? user.full_name.charAt(0) : <User size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-sidebar-foreground truncate group-hover:text-[#a38413] transition-colors">
                  {user?.full_name || 'User Account'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground truncate font-medium">@{user?.username || 'user'}</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Quick Actions (Theme & Logout) */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-sidebar-border">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-sidebar-foreground bg-sidebar-accent border border-sidebar-border hover:bg-muted transition-colors"
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-red-500 bg-red-950/30 border border-red-900/40 hover:bg-red-900/50 transition-colors"
              >
                <SignOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;