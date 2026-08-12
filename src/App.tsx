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
  CurrencyDollar,
  User,
  Truck,
  Factory,
  Printer,
  Download,
  TrendUp,
  TrendDown
} from '@phosphor-icons/react';
import { Toaster, toast } from 'sonner';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

import './index.css';

// ===== Theme Context =====
const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {}
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'light' mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    // If no saved theme, default to 'light'
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    // Apply theme class to html element
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

// 1. Sidebar
const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { name: 'Dashboard', icon: House, active: true },
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
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#1a1a1a]
        border-r border-gray-200 dark:border-gray-800
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#a38413] flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#a38413]">Haqmat</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sales Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    item.active
                      ? 'bg-[#a38413]/10 text-[#a38413] font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                  {item.active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a38413]" />
                  )}
                </a>
              ))}
            </div>
          </ScrollArea>

          {/* Bottom Controls */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
              <Translate size={20} />
              <span>አማ / EN</span>
            </button>
            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200">
              <SignOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// 2. Header
const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
        >
          <Package size={22} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back, Mahlet</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Sale
        </Button>
        <Avatar className="h-8 w-8 rounded-full">
          <AvatarFallback className="bg-[#a38413] text-white text-sm font-medium">
            M
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

// 3. StatCard
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  description?: string;
}> = ({ title, value, icon, trend, trendLabel, description }) => {
  const isPositive = trend && trend > 0;
  
  return (
    <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[#a38413]">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {isPositive ? (
              <TrendUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span className={`text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {Math.abs(trend)}%
            </span>
            {trendLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {trendLabel}
              </span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

// 4. Toast Demo
const ToastDemo: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="default" 
        size="sm" 
        className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white"
        onClick={() => toast.success('Success!', { description: 'Operation completed successfully' })}
      >
        Success
      </Button>
      <Button 
        variant="secondary" 
        size="sm" 
        className="rounded-xl"
        onClick={() => toast.error('Error!', { description: 'Something went wrong' })}
      >
        Error
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-xl"
        onClick={() => toast.warning('Warning!', { description: 'Please check your input' })}
      >
        Warning
      </Button>
      <Button 
        variant="secondary" 
        size="sm" 
        className="rounded-xl"
        onClick={() => toast.info('Info', { description: 'Here is some information' })}
      >
        Info
      </Button>
    </div>
  );
};

// 5. EmptyState
const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4 text-gray-500 dark:text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      {action}
    </div>
  );
};

// ===== MAIN APP =====
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data
  const stats = [
    { 
      title: 'Total Sales', 
      value: '$45,231.89', 
      icon: <CurrencyDollar size={20} />, 
      trend: 12.5, 
      trendLabel: 'vs last month',
      description: 'Revenue from all sales'
    },
    { 
      title: 'Grain Intake', 
      value: '2,847 kg', 
      icon: <Truck size={20} />, 
      trend: -3.2, 
      trendLabel: 'vs last month',
      description: 'Total grain purchased'
    },
    { 
      title: 'Milling Output', 
      value: '1,893 kg', 
      icon: <Factory size={20} />, 
      trend: 8.1, 
      trendLabel: 'vs last month',
      description: 'Flour produced'
    },
    { 
      title: 'Total Expenses', 
      value: '$12,345.00', 
      icon: <Wallet size={20} />, 
      trend: -5.4, 
      trendLabel: 'vs last month',
      description: 'All operational costs'
    },
  ];

  const tableHeaders = ['Receipt #', 'Date', 'Customer', 'Product', 'Quantity', 'Total'];
  const tableData = [
    { receipt: 'REC-2024-001', date: '2024-01-15', customer: 'Abebe Kebede', product: 'Teff Flour', quantity: '50 kg', total: '$75.00' },
    { receipt: 'REC-2024-002', date: '2024-01-16', customer: 'Martha Tadesse', product: 'Wheat Flour', quantity: '25 kg', total: '$37.50' },
    { receipt: 'REC-2024-003', date: '2024-01-17', customer: 'Kassa Hailu', product: 'Teff Flour', quantity: '100 kg', total: '$150.00' },
    { receipt: 'REC-2024-004', date: '2024-01-18', customer: 'Sara Mohammed', product: 'Barley Flour', quantity: '30 kg', total: '$45.00' },
    { receipt: 'REC-2024-005', date: '2024-01-19', customer: 'Dawit Girma', product: 'Teff Flour', quantity: '75 kg', total: '$112.50' },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-[#121212]">
        {/* Toast Container */}
        <Toaster position="bottom-right" richColors closeButton />

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="lg:ml-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-5 md:p-6 max-w-7xl mx-auto bg-white dark:bg-[#121212]">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your sales and inventory</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="rounded-xl p-1 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="sales"
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                >
                  Sales
                </TabsTrigger>
                <TabsTrigger 
                  value="inventory"
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                >
                  Inventory
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1a1a1a] data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                >
                  Reports
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-gray-900 dark:text-white">Recent Sales</CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">
                          Last 5 transactions
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Printer className="mr-1 h-4 w-4" />
                          Print
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Download className="mr-1 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mx-6">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                          <TableRow className="hover:bg-transparent">
                            {tableHeaders.map((header) => (
                              <TableHead key={header} className="text-gray-500 dark:text-gray-400 font-medium">
                                {header}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((row, index) => (
                            <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <TableCell className="font-medium text-gray-900 dark:text-white">{row.receipt}</TableCell>
                              <TableCell className="text-gray-500 dark:text-gray-400">{row.date}</TableCell>
                              <TableCell className="text-gray-900 dark:text-white">{row.customer}</TableCell>
                              <TableCell className="text-gray-900 dark:text-white">{row.product}</TableCell>
                              <TableCell className="text-gray-900 dark:text-white">{row.quantity}</TableCell>
                              <TableCell className="text-gray-900 dark:text-white font-medium">{row.total}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sales" className="mt-6">
                <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Sales Data</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Detailed sales information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400">Sales content goes here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="inventory" className="mt-6">
                <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Inventory Status</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Current stock levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400">Inventory content goes here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reports" className="mt-6">
                <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Reports</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Generate and view reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400">Reports content goes here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Left Column - Form Demo */}
              <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Quick Sale</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Record a new sale quickly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-gray-600 dark:text-gray-300">
                      Customer Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input 
                        id="customer"
                        placeholder="Enter customer name" 
                        className="pl-9 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-[#a38413]/20"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="product" className="text-gray-600 dark:text-gray-300">
                      Product
                    </Label>
                    <Select>
                      <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800">
                        <SelectItem value="teff">Teff Flour</SelectItem>
                        <SelectItem value="wheat">Wheat Flour</SelectItem>
                        <SelectItem value="barley">Barley Flour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-gray-600 dark:text-gray-300">
                        Quantity
                      </Label>
                      <Input 
                        id="quantity"
                        type="number" 
                        placeholder="0" 
                        className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-gray-600 dark:text-gray-300">
                        Price
                      </Label>
                      <div className="relative">
                        <CurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input 
                          id="price"
                          type="number" 
                          placeholder="0.00" 
                          className="pl-9 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Sale
                  </Button>
                </CardContent>
              </Card>

              {/* Right Column - Component Showcase */}
              <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Component Showcase</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    shadcn/ui components in action
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Badges */}
                  <div>
                    <Label className="text-gray-600 dark:text-gray-300 block mb-2">Status Badges</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="rounded-full">Default</Badge>
                      <Badge variant="secondary" className="rounded-full">Secondary</Badge>
                      <Badge variant="destructive" className="rounded-full">Destructive</Badge>
                      <Badge variant="outline" className="rounded-full">Outline</Badge>
                      <Badge className="bg-green-600 text-white rounded-full">Success</Badge>
                      <Badge className="bg-yellow-600 text-white rounded-full">Warning</Badge>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Buttons */}
                  <div>
                    <Label className="text-gray-600 dark:text-gray-300 block mb-2">Button Variants</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="default" className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white">Default</Button>
                      <Button variant="secondary" className="rounded-xl">Secondary</Button>
                      <Button variant="outline" className="rounded-xl">Outline</Button>
                      <Button variant="destructive" className="rounded-xl">Destructive</Button>
                      <Button variant="ghost" className="rounded-xl">Ghost</Button>
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Toast Demo */}
                  <div>
                    <Label className="text-gray-600 dark:text-gray-300 block mb-2">Toast Notifications</Label>
                    <ToastDemo />
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Dialog Trigger */}
                  <div>
                    <Label className="text-gray-600 dark:text-gray-300 block mb-2">Dialog / Modal</Label>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger>
                        <Button className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white">Open Dialog</Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-2xl bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-white">Confirm Action</DialogTitle>
                          <DialogDescription className="text-gray-500 dark:text-gray-400">
                            Are you sure you want to perform this action? This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 py-4">
                          <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-4 w-full">
                            <p className="text-sm text-gray-900 dark:text-white">Sample dialog content</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                            Cancel
                          </Button>
                          <Button className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white" onClick={() => {
                            toast.success('Action confirmed!');
                            setDialogOpen(false);
                          }}>
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-800" />

                  {/* Skeleton Loader Demo */}
                  <div>
                    <Label className="text-gray-600 dark:text-gray-300 block mb-2">Loading States</Label>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-xl bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-4 w-full rounded-xl bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-4 w-5/6 rounded-xl bg-gray-200 dark:bg-gray-800" />
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Skeleton className="h-16 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="h-16 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="h-16 rounded-xl bg-gray-200 dark:bg-gray-800" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Empty State */}
            <div className="mt-6">
              <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Empty State Example</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    When no data is available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    icon={<Package size={40} className="text-gray-500 dark:text-gray-400" />}
                    title="No Products Found"
                    description="Start by adding your first product to the inventory."
                    action={
                      <Button className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
              <p>Haqmat Sales Management Platform v1.0</p>
              <p className="mt-1">© 2026 All rights reserved</p>
            </footer>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;