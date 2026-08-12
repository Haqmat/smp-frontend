import React, { useState, useEffect } from 'react';
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
  Plus,
  MagnifyingGlass,
  CurrencyDollar,
  User,
  Truck,
  Factory,
  CaretDown,
  CaretUp,
  Printer,
  Download,
  X
} from '@phosphor-icons/react';
import { Toaster, toast } from 'sonner';
import './index.css';

// ===== Theme Context =====
const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {}
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => React.useContext(ThemeContext);

// ===== Components =====

// 1. Button
const Button: React.FC<{
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick, 
  disabled = false,
  className = '',
  leftIcon,
  rightIcon
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white',
    secondary: 'bg-[var(--color-bg-subtle)] hover:bg-[var(--color-border-light)] text-[var(--color-text-main)]',
    outline: 'border border-[var(--color-border-light)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-main)]',
    danger: 'bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white'
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

// 2. Card
const Card: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}> = ({ title, subtitle, children, className = '', headerAction }) => {
  return (
    <div className={`bg-[var(--color-bg-light)] border border-[var(--color-border-light)] rounded-lg p-5 transition-shadow hover:shadow-sm ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-[var(--color-text-main)]">{title}</h3>}
            {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// 3. Input
const Input: React.FC<{
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}> = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  leftIcon,
  rightIcon,
  className = ''
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-muted)]">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-md border bg-[var(--color-bg-light)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] transition-colors duration-200 ${
            error 
              ? 'border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/20' 
              : 'border-[var(--color-border-light)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]'
          } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
          onChange={onChange}
          value={value}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  );
};

// 4. Badge
const Badge: React.FC<{
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'neutral', children, className = '' }) => {
  const variantClasses = {
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
    error: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    info: 'bg-[var(--color-bg-subtle)] text-[var(--color-primary)] border border-[var(--color-border-light)]',
    neutral: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// 5. StatCard
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}> = ({ title, value, icon, trend, trendLabel }) => {
  const isPositive = trend && trend > 0;
  
  return (
    <div className="bg-[var(--color-bg-light)] border border-[var(--color-border-light)] rounded-lg p-5 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
          <p className="text-2xl font-semibold text-[var(--color-text-main)] mt-1">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <CaretUp size={16} className="text-[var(--color-success)]" />
              ) : (
                <CaretDown size={16} className="text-[var(--color-danger)]" />
              )}
              <span className={`text-sm ${isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-bg-subtle)] text-[var(--color-primary)]">
          {icon}
        </div>
      </div>
    </div>
  );
};

// 6. Table
const Table: React.FC<{
  headers: string[];
  data: any[][];
  className?: string;
}> = ({ headers, data, className = '' }) => {
  return (
    <div className="overflow-x-auto border border-[var(--color-border-light)] rounded-lg">
      <table className={`w-full text-sm ${className}`}>
        <thead>
          <tr className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border-light)]">
            {headers.map((header, index) => (
              <th key={index} className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-[var(--color-border-light)] last:border-0 hover:bg-[var(--color-bg-subtle)] transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 px-4 text-[var(--color-text-main)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 7. Modal
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className={`${sizeClasses[size]} w-full bg-[var(--color-bg-light)] border border-[var(--color-border-light)] rounded-lg shadow-xl max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-main)]">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// 8. Tabs
const Tabs: React.FC<{
  tabs: { key: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (key: string) => void;
}> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex border-b border-[var(--color-border-light)] bg-[var(--color-bg-light)] rounded-t-lg">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 flex items-center gap-2 ${
            activeTab === tab.key
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// 9. Sidebar
const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { name: 'Dashboard', icon: House },
    { name: 'Inventory', icon: Package },
    { name: 'Sales', icon: ShoppingCart },
    { name: 'Expenses', icon: Wallet },
    { name: 'Reports', icon: ChartBar },
    { name: 'Users', icon: Users },
    { name: 'Settings', icon: Gear },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[var(--color-bg-light)] border-r border-[var(--color-border-light)]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-[var(--color-border-light)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--color-primary)]">Haqmat</h1>
                <p className="text-xs text-[var(--color-text-muted)]">Sales Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <a
                key={item.name}
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-all duration-200"
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Bottom Controls */}
          <div className="p-4 border-t border-[var(--color-border-light)] space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-all duration-200 w-full"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-subtle)] transition-all duration-200 w-full">
              <Translate size={20} />
              <span>አማ / EN</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-all duration-200 w-full">
              <SignOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// 10. Header
const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-[var(--color-bg-light)] border-b border-[var(--color-border-light)] px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-[var(--color-bg-subtle)] rounded-md text-[var(--color-text-muted)] transition-colors">
          <Package size={22} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-[var(--color-text-main)]">Dashboard</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Welcome back, Mahlet</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" leftIcon={<Plus size={16} />}>
          New Sale
        </Button>
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-medium text-sm">
          M
        </div>
      </div>
    </header>
  );
};

// 11. Toast Demo
const ToastDemo: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => toast.success('Success!', { description: 'Operation completed' })}>Success</Button>
      <Button size="sm" variant="secondary" onClick={() => toast.error('Error!', { description: 'Something went wrong' })}>Error</Button>
      <Button size="sm" variant="outline" onClick={() => toast.warning('Warning!', { description: 'Please check your input' })}>Warning</Button>
      <Button size="sm" variant="secondary" onClick={() => toast.info('Info', { description: 'Here is some information' })}>Info</Button>
    </div>
  );
};

// 12. EmptyState
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex p-4 rounded-full bg-[var(--color-bg-subtle)] mb-4 text-[var(--color-text-muted)]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">{description}</p>
      {action}
    </div>
  );
};

// 13. Skeleton
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-[var(--color-border-light)] rounded ${className}`} />
  );
};

// ===== MAIN APP =====
export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Total Sales', value: '$45,231.89', icon: <CurrencyDollar size={22} />, trend: 12.5, trendLabel: 'vs last month' },
    { title: 'Grain Intake', value: '2,847 kg', icon: <Truck size={22} />, trend: -3.2, trendLabel: 'vs last month' },
    { title: 'Milling Output', value: '1,893 kg', icon: <Factory size={22} />, trend: 8.1, trendLabel: 'vs last month' },
    { title: 'Total Expenses', value: '$12,345.00', icon: <Wallet size={22} />, trend: -5.4, trendLabel: 'vs last month' },
  ];

  const tableHeaders = ['Receipt #', 'Date', 'Customer', 'Product', 'Quantity', 'Total'];
  const tableData = [
    ['REC-2024-001', '2024-01-15', 'Abebe Kebede', 'Teff Flour', '50 kg', '$75.00'],
    ['REC-2024-002', '2024-01-16', 'Martha Tadesse', 'Wheat Flour', '25 kg', '$37.50'],
    ['REC-2024-003', '2024-01-17', 'Kassa Hailu', 'Teff Flour', '100 kg', '$150.00'],
    ['REC-2024-004', '2024-01-18', 'Sara Mohammed', 'Barley Flour', '30 kg', '$45.00'],
    ['REC-2024-005', '2024-01-19', 'Dawit Girma', 'Teff Flour', '75 kg', '$112.50'],
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-text-main)]">
        <Toaster position="bottom-right" richColors closeButton />

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:ml-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-5 md:p-6 max-w-7xl mx-auto bg-[var(--color-bg-light)]">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-[var(--color-text-main)]">Dashboard</h1>
              <p className="text-sm text-[var(--color-text-muted)]">Overview of your sales and inventory</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Tabs */}
            <Tabs
              tabs={[
                { key: 'overview', label: 'Overview' },
                { key: 'sales', label: 'Sales' },
                { key: 'inventory', label: 'Inventory' },
                { key: 'reports', label: 'Reports' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <div className="mt-6">
              <Card
                title="Recent Sales"
                subtitle="Last 5 transactions"
                headerAction={
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" leftIcon={<Printer size={15} />}>Print</Button>
                    <Button size="sm" variant="outline" leftIcon={<Download size={15} />}>Export</Button>
                  </div>
                }
              >
                <Table headers={tableHeaders} data={tableData} />
              </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
              <Card title="Quick Sale">
                <div className="space-y-4">
                  <Input label="Customer Name" placeholder="Enter customer name" required leftIcon={<User size={16} />} />
                  <Input label="Product" placeholder="Search products..." leftIcon={<MagnifyingGlass size={16} />} rightIcon={<CaretDown size={16} />} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Quantity" type="number" placeholder="0" rightIcon={<Package size={16} />} />
                    <Input label="Price" type="number" placeholder="0.00" leftIcon={<CurrencyDollar size={16} />} />
                  </div>
                  <Button className="w-full" leftIcon={<Plus size={18} />}>Add to Sale</Button>
                </div>
              </Card>

              <Card title="Component Showcase">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Status Badges</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success">Active</Badge>
                      <Badge variant="warning">Pending</Badge>
                      <Badge variant="error">Voided</Badge>
                      <Badge variant="info">Processing</Badge>
                      <Badge variant="neutral">Draft</Badge>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Button Variants</label>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">Primary</Button>
                      <Button size="sm" variant="secondary">Secondary</Button>
                      <Button size="sm" variant="outline">Outline</Button>
                      <Button size="sm" variant="danger">Danger</Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Toast Notifications</label>
                    <ToastDemo />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Modal</label>
                    <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Empty State */}
            <div className="mt-6">
              <Card title="Empty State Example">
                <EmptyState
                  icon={<Package size={40} />}
                  title="No Products Found"
                  description="Start by adding your first product to the inventory."
                  action={<Button leftIcon={<Plus size={16} />}>Add Product</Button>}
                />
              </Card>
            </div>

            {/* Skeleton Demo */}
            <div className="mt-6">
              <Card title="Loading State Demo">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border-light)] pt-4">
              <p>Haqmat Sales Management Platform v1.0</p>
              <p className="mt-1">© 2026 All rights reserved</p>
            </footer>
          </main>
        </div>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Sample Modal">
          <div className="space-y-4">
            <p className="text-[var(--color-text-main)]">This is a modal dialog.</p>
            <div className="flex gap-3">
              <Input label="Name" placeholder="Enter name" />
              <Input label="Email" type="email" placeholder="Enter email" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button>Save</Button>
            </div>
          </div>
        </Modal>
      </div>
    </ThemeProvider>
  );
}

export default App;