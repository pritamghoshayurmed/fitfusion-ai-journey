
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    // Redirect to auth page if user is not authenticated
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render the children components
  return <>{children}</>;
};

export default RouteGuard;
