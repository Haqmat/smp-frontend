import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { List, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Convert pathname like /inventory/grain-intake into "Inventory / Grain Intake"
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return 'Dashboard';

    return paths
      .map(path => {
        // Capitalize and replace hyphens
        const word = path.replace(/-/g, ' ');
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' / ');
  };

  return (
    <header className="h-16 bg-card text-card-foreground border-b border-border px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-accent rounded-xl text-muted-foreground transition-colors"
          aria-label="Open menu"
        >
          <List size={24} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground leading-none">
            {getBreadcrumbs()}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Logged in as: <span className="font-semibold text-foreground">{user?.full_name || 'User'}</span> ({user?.role || 'Guest'})
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigate('/sales/new')}
          className="rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white px-4 h-10 text-sm font-medium shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
        <Avatar className="h-9 w-9 rounded-full">
          <AvatarFallback className="bg-[#5A3E2B] text-white text-sm font-medium">
            {user?.full_name ? getInitials(user.full_name) : 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;