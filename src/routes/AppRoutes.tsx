import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Layouts
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Error page
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
          // TODO: Add more routes here
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