
import React from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/diet':
        return 'Diet Plan';
      case '/workouts':
        return 'Workouts';
      case '/tracker':
        return 'Tracker';
      case '/camera':
        return 'AI Camera';
      case '/profile':
        return 'Profile';
      default:
        return 'FitFusion';
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-800">{getPageTitle()}</h1>
          <div className="h-1 w-20 bg-fitfusion-purple mt-2 rounded-full"></div>
        </header>
        <main className={cn("animate-fade-in")}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
