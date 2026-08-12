import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const AuthenticatedLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar - fixed */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area with left margin for sidebar */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header - fixed at top */}
        <div className="sticky top-0 z-30 bg-white dark:bg-[#1a1a1a]">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
        
        {/* Main content - fills remaining space */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;