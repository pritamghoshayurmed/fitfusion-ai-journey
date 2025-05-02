
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Droplet, Circle, Camera, Dumbbell, Utensils } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile, trackingData, diaryEntries, isProfileComplete } = useUser();
  
  const recentTrackingData = trackingData.slice(-7);
  
  const todayEntries = diaryEntries.filter(
    entry => entry.date === new Date().toISOString().split('T')[0]
  );
  
  const waterIntakeToday = todayEntries
    .filter(entry => entry.type === 'water')
    .reduce((total, entry) => total + entry.value, 0);
  
  const stepsToday = todayEntries
    .filter(entry => entry.type === 'steps')
    .reduce((total, entry) => total + entry.value, 0);

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold font-heading mb-3">Welcome to FitFusion</h2>
          <p className="text-gray-600 mb-6">
            To get started with personalized fitness tracking and recommendations, please create your profile.
          </p>
          <Button 
            onClick={() => navigate('/profile')}
            className="bg-fitfusion-purple hover:bg-purple-600"
          >
            Create Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome section */}
      <section className="bg-gradient-to-r from-fitfusion-purple to-fitfusion-blue rounded-xl p-6 text-white shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {userProfile?.name}!
        </h2>
        <p>Let's continue working towards your {userProfile?.fitnessGoal.replace('-', ' ')} goal today.</p>
      </section>
      
      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {trackingData.length > 0 ? trackingData[trackingData.length - 1].weight : userProfile?.weight} kg
              </span>
              {trackingData.length > 1 && trackingData[trackingData.length - 1].weight && trackingData[trackingData.length - 2].weight && (
                <span className={`ml-2 text-xs ${trackingData[trackingData.length - 1].weight! < trackingData[trackingData.length - 2].weight! ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp size={16} className="inline" />
                  {Math.abs(trackingData[trackingData.length - 1].weight! - trackingData[trackingData.length - 2].weight!).toFixed(1)} kg
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Calories Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {todayEntries.filter(e => e.type === 'food').reduce((sum, entry) => sum + entry.value, 0)}
              </span>
              <span className="text-sm text-gray-500 ml-1">/ 2000</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Water Intake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Droplet className="text-fitfusion-blue mr-2" size={16} />
              <span className="text-2xl font-bold">{(waterIntakeToday / 1000).toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-1">/ 2.5 L</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Circle className="text-fitfusion-purple mr-2" size={16} />
              <span className="text-2xl font-bold">{stepsToday}</span>
              <span className="text-sm text-gray-500 ml-1">/ 10,000</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Weight Progress Chart */}
      <section className="mb-8">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {recentTrackingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={recentTrackingData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#8B5CF6" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-gray-500 mb-4">No weight data available yet.</p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/tracker')}
                    className="flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Weight Data
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Quick Add Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-fitfusion-softPurple hover:bg-fitfusion-softPurple/80 cursor-pointer transition-all" onClick={() => navigate('/diet')}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Utensils className="h-10 w-10 text-fitfusion-purple mb-2" />
            <h3 className="font-semibold text-center">Log Food</h3>
          </CardContent>
        </Card>
        <Card className="bg-fitfusion-softBlue hover:bg-fitfusion-softBlue/80 cursor-pointer transition-all" onClick={() => navigate('/workouts')}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Dumbbell className="h-10 w-10 text-fitfusion-blue mb-2" />
            <h3 className="font-semibold text-center">Start Workout</h3>
          </CardContent>
        </Card>
        <Card className="bg-fitfusion-green hover:bg-fitfusion-green/80 cursor-pointer transition-all" onClick={() => navigate('/camera')}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Camera className="h-10 w-10 text-fitfusion-purple mb-2" />
            <h3 className="font-semibold text-center">Scan Food</h3>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
