
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Salad, 
  Dumbbell, 
  Activity, 
  Camera, 
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, onClick }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center p-3 mb-2 rounded-lg transition-all",
        "hover:bg-fitfusion-softPurple",
        isActive 
          ? "bg-fitfusion-purple text-white" 
          : "text-gray-700"
      )}
      onClick={onClick}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { userProfile, isAuthenticated, signOut } = useUser();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success("You have been signed out");
  };

  const handleProfileClick = () => {
    closeSidebar();
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      navigate('/profile');
    }
  };

  const sidebarClass = cn(
    "bg-white h-screen z-30 shadow-lg flex flex-col transition-all duration-300",
    isMobile 
      ? cn("fixed top-0 left-0 w-64", isOpen ? "translate-x-0" : "-translate-x-full") 
      : "w-64 sticky top-0"
  );

  return (
    <>
      {/* Mobile menu toggle */}
      {isMobile && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md text-gray-800"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      <div className={sidebarClass}>
        <div className="p-5 border-b">
          <h1 className="text-xl font-bold text-fitfusion-purple font-heading">
            FitFusion
          </h1>
        </div>

        <div className="flex-1 p-5 overflow-auto">
          <nav>
            <NavItem to="/" icon={Home} label="Dashboard" onClick={closeSidebar} />
            <NavItem to="/diet" icon={Salad} label="Diet Plan" onClick={closeSidebar} />
            <NavItem to="/workouts" icon={Dumbbell} label="Workouts" onClick={closeSidebar} />
            <NavItem to="/tracker" icon={Activity} label="Tracker" onClick={closeSidebar} />
            <NavItem to="/camera" icon={Camera} label="AI Camera" onClick={closeSidebar} />
          </nav>
        </div>

        <div className="p-5 border-t">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div 
                className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={handleProfileClick}
              >
                <div className="w-10 h-10 bg-fitfusion-softPurple text-fitfusion-purple rounded-full flex items-center justify-center mr-3">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium">
                    {userProfile?.name || "My Profile"}
                  </p>
                  {userProfile && (
                    <p className="text-xs text-gray-500">
                      {userProfile.fitnessGoal.replace('-', ' ')}
                    </p>
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={handleSignOut}
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={handleProfileClick}
            >
              <div className="w-10 h-10 bg-fitfusion-softPurple text-fitfusion-purple rounded-full flex items-center justify-center mr-3">
                <User size={20} />
              </div>
              <div>
                <p className="font-medium">Sign In / Sign Up</p>
                <p className="text-xs text-gray-500">Create an account</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={closeSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
