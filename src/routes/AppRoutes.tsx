import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Layouts
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage';

// Dashboard Page
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Inventory Pages
import GrainIntakePage from '@/pages/inventory/GrainIntakePage';
import GrainIntakeDetailPage from '@/pages/inventory/GrainIntakeDetailPage';
import MillingPage from '@/pages/inventory/MillingPage';
import StockLevelsPage from '@/pages/inventory/StockLevelsPage';
import StockMovementsPage from '@/pages/inventory/StockMovementsPage';

// Sales Pages
import NewSalePage from '@/pages/sales/NewSalePage';
import SalesListPage from '@/pages/sales/SalesListPage';
import SaleDetailPage from '@/pages/sales/SaleDetailPage';

// Expenses Pages
import NewExpensePage from '@/pages/expenses/NewExpensePage';
import ExpensesListPage from '@/pages/expenses/ExpensesListPage';

// Reports Pages
import AnnualSalesReportPage from '@/pages/reports/AnnualSalesReportPage';
import ProfitLossReportPage from '@/pages/reports/ProfitLossReportPage';

// Admin Pages
import UserManagementPage from '@/pages/admin/UserManagementPage';
import ProductManagementPage from '@/pages/admin/ProductManagementPage';
import SystemConfigPage from '@/pages/admin/SystemConfigPage';

// User & Help Pages
import ProfilePage from '@/pages/user/ProfilePage';
import HelpPage from '@/pages/help/HelpPage';

// Error Page
import NotFoundPage from '@/pages/NotFoundPage';

// Protected Route Guard
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a38413]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// Auth Route Guard (redirects to dashboard if already authenticated)
const AuthRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a38413]"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

// Change Password Route Guard (only accessible if user needs to change password)
const ChangePasswordRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a38413]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.is_first_login) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

const AppRoutes = createBrowserRouter([
  // Auth routes (public)
  {
    path: '/',
    element: <AuthRoute />,
    children: [
      {
        path: '/login',
        element: <AuthLayout />,
        children: [
          { index: true, element: <LoginPage /> },
        ],
      },
      {
        path: '/change-password',
        element: <ChangePasswordRoute />,
        children: [
          { index: true, element: <ChangePasswordPage /> },
        ],
      },
    ],
  },
  
  // Protected routes (require authentication)
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AuthenticatedLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          
          // User & System Routes
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SystemConfigPage /> },
          { path: 'help', element: <HelpPage /> },

          // Inventory Routes
          { path: 'inventory/grain-intake', element: <GrainIntakePage /> },
          { path: 'inventory/grain-intake/:receiptNumber', element: <GrainIntakeDetailPage /> },
          { path: 'inventory/milling', element: <MillingPage /> },
          { path: 'inventory/stock-levels', element: <StockLevelsPage /> },
          { path: 'inventory/stock-movements', element: <StockMovementsPage /> },
          { path: 'inventory/stock-movements/:productId', element: <StockMovementsPage /> },

          // Sales Routes
          { path: 'sales/new', element: <NewSalePage /> },
          { path: 'sales', element: <SalesListPage /> },
          { path: 'sales/:receiptNumber', element: <SaleDetailPage /> },

          // Expenses Routes
          { path: 'expenses/new', element: <NewExpensePage /> },
          { path: 'expenses', element: <ExpensesListPage /> },

          // Reports Routes
          { path: 'reports/annual-sales', element: <AnnualSalesReportPage /> },
          { path: 'reports/profit-loss', element: <ProfitLossReportPage /> },

          // Admin Routes
          { path: 'admin/users', element: <UserManagementPage /> },
          { path: 'admin/products', element: <ProductManagementPage /> },
          { path: 'admin/config', element: <SystemConfigPage /> },
        ],
      },
    ],
  },
  
  // 404 - Not found (outside the layout, full screen, no scroll)
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default AppRoutes;