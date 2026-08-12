import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  House, 
  Package, 
  ShoppingCart, 
  Wallet, 
  ChartBar, 
  Users, 
  Gear,
  Sun,
  Moon,
  Translate,
  SignOut,
  X,
} from '@phosphor-icons/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', icon: House, path: '/dashboard' },
    { name: 'Inventory', icon: Package, path: '/inventory' },
    { name: 'Sales', icon: ShoppingCart, path: '/sales' },
    { name: 'Expenses', icon: Wallet, path: '/expenses' },
    { name: 'Reports', icon: ChartBar, path: '/reports' },
    ...(user?.role === 'ADMIN' ? [{ name: 'Users', icon: Users, path: '/users' }] : []),
    ...(user?.role === 'ADMIN' ? [{ name: 'Settings', icon: Gear, path: '/settings' }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    onClose(); // Close sidebar on logout
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    // Only navigate - DO NOT close sidebar
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay - ONLY closes sidebar when clicking whitespace */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#1a1a1a]
        border-r border-gray-200 dark:border-gray-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with Close Button (X) */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                // Only navigate - DO NOT close sidebar
                if (window.innerWidth < 1024) {
                  navigate('/dashboard');
                  // Sidebar stays open!
                } else {
                  navigate('/dashboard');
                }
              }}
            >
              <div className="w-11 h-11 rounded-xl bg-[#a38413] flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#a38413]">Haqmat</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sales Management</p>
              </div>
            </div>
            
            {/* Close (X) Button - Only visible on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-[#a38413]/10 text-[#a38413] font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={22} />
                  <span>{item.name}</span>
                  {isActive(item.path) && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[#a38413]" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Bottom Controls */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
              <Translate size={22} />
              <span>አማ / EN</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <SignOut size={22} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;