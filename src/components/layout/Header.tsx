import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
        >
          <Package size={24} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.full_name || 'User'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white px-4 py-2" size="default">
          <Plus className="mr-2 h-5 w-5" />
          New Sale
        </Button>
        <Avatar className="h-9 w-9 rounded-full">
          <AvatarFallback className="bg-[#a38413] text-white text-sm font-medium">
            {user?.full_name ? getInitials(user.full_name) : 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;