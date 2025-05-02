
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This component simply redirects to the Dashboard
    navigate('/', { replace: true });
  }, [navigate]);

  // Return the Dashboard component directly to avoid a flash of empty content
  return <Dashboard />;
};

export default Index;
