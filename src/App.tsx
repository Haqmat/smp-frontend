import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRoutes from '@/routes/AppRoutes';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="bottom-right" richColors closeButton />
        <RouterProvider router={AppRoutes} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;