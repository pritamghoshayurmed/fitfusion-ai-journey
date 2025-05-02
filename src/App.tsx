
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Layout from "./components/Layout";
import RouteGuard from "./components/RouteGuard";

// Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DietPlan from "./pages/DietPlan";
import Workouts from "./pages/Workouts";
import Tracker from "./pages/Tracker";
import AICamera from "./pages/AICamera";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<RouteGuard><Layout><Dashboard /></Layout></RouteGuard>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/diet" element={<RouteGuard><Layout><DietPlan /></Layout></RouteGuard>} />
            <Route path="/workouts" element={<RouteGuard><Layout><Workouts /></Layout></RouteGuard>} />
            <Route path="/tracker" element={<RouteGuard><Layout><Tracker /></Layout></RouteGuard>} />
            <Route path="/camera" element={<RouteGuard><Layout><AICamera /></Layout></RouteGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
