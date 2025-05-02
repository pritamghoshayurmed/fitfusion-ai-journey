
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { Plus, Activity, Weight, Flame, Droplet } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const Tracker = () => {
  const navigate = useNavigate();
  const { userProfile, isProfileComplete, trackingData, addTrackingData, diaryEntries, addDiaryEntry } = useUser();
  const [activeTab, setActiveTab] = useState('weight');
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [weightInput, setWeightInput] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  
  const recentTrackingData = trackingData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;

    addTrackingData({
      date: todayDate,
      weight: parseFloat(weightInput)
    });
    
    addDiaryEntry({
      id: uuidv4(),
      date: todayDate,
      type: 'food',
      value: 0,
      notes: `Recorded weight: ${weightInput} kg`
    });

    toast.success(`Weight updated: ${weightInput} kg`);
    setWeightInput('');
  };

  const handleAddCalories = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caloriesInput) return;

    addTrackingData({
      date: todayDate,
      caloriesConsumed: parseInt(caloriesInput)
    });
    
    addDiaryEntry({
      id: uuidv4(),
      date: todayDate,
      type: 'food',
      value: parseInt(caloriesInput),
      notes: `Calories consumed: ${caloriesInput}`
    });

    toast.success(`Calories logged: ${caloriesInput}`);
    setCaloriesInput('');
  };

  const handleAddWater = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waterInput) return;

    const waterMl = parseInt(waterInput);
    
    addTrackingData({
      date: todayDate,
      waterIntake: waterMl
    });
    
    addDiaryEntry({
      id: uuidv4(),
      date: todayDate,
      type: 'water',
      value: waterMl,
      notes: `Water intake: ${waterMl} ml`
    });

    toast.success(`Water intake logged: ${waterInput} ml`);
    setWaterInput('');
  };

  const handleAddSteps = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepsInput) return;

    const steps = parseInt(stepsInput);
    
    addTrackingData({
      date: todayDate,
      steps: steps
    });
    
    addDiaryEntry({
      id: uuidv4(),
      date: todayDate,
      type: 'steps',
      value: steps,
      notes: `Steps recorded: ${steps}`
    });

    toast.success(`Steps logged: ${stepsInput}`);
    setStepsInput('');
  };

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Profile Required</h2>
          <p className="text-gray-600 mb-6">
            To track your progress, please create your profile first.
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
      <Tabs defaultValue="weight" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="weight" className="flex items-center">
            <Weight className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Weight</span>
          </TabsTrigger>
          <TabsTrigger value="calories" className="flex items-center">
            <Flame className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Calories</span>
          </TabsTrigger>
          <TabsTrigger value="water" className="flex items-center">
            <Droplet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Water</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weight">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weight History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {recentTrackingData.filter(d => d.weight).length > 0 ? (
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
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          name="Weight (kg)"
                          stroke="#8B5CF6" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-500 mb-4">No weight data available yet.</p>
                      <p className="text-sm text-gray-400">Add your weight using the form to the right</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Log Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddWeight} className="space-y-4">
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <Input
                      id="weight"
                      type="number"
                      min="30"
                      max="300"
                      step="0.1"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder="Enter weight"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-fitfusion-purple hover:bg-purple-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Weight
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Current Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Starting weight:</span>
                      <span className="font-medium">{userProfile.weight} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current weight:</span>
                      <span className="font-medium">
                        {trackingData.length > 0 && trackingData[trackingData.length - 1].weight 
                          ? `${trackingData[trackingData.length - 1].weight} kg`
                          : `${userProfile.weight} kg`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="calories">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Calorie History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {recentTrackingData.filter(d => d.caloriesConsumed || d.caloriesBurned).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
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
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="caloriesConsumed" name="Calories In" fill="#8B5CF6" />
                        <Bar dataKey="caloriesBurned" name="Calories Burned" fill="#0EA5E9" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-500 mb-4">No calorie data available yet.</p>
                      <p className="text-sm text-gray-400">Add calorie information using the form to the right</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Log Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCalories} className="space-y-4">
                  <div>
                    <label htmlFor="calories" className="block text-sm font-medium mb-1">Calories Consumed</label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      value={caloriesInput}
                      onChange={(e) => setCaloriesInput(e.target.value)}
                      placeholder="Enter calories"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-fitfusion-purple hover:bg-purple-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Log Calories
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Today's Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Calories consumed:</span>
                      <span className="font-medium">
                        {diaryEntries
                          .filter(e => e.date === todayDate && e.type === 'food')
                          .reduce((sum, entry) => sum + entry.value, 0)} kcal
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recommended daily:</span>
                      <span className="font-medium">2000 kcal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="water">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Water Intake History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {recentTrackingData.filter(d => d.waterIntake).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
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
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="waterIntake" 
                          name="Water (ml)" 
                          fill="#0EA5E9" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-500 mb-4">No water intake data available yet.</p>
                      <p className="text-sm text-gray-400">Log your water intake using the form to the right</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Log Water Intake</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddWater} className="space-y-4">
                  <div>
                    <label htmlFor="water" className="block text-sm font-medium mb-1">Water (ml)</label>
                    <Input
                      id="water"
                      type="number"
                      min="0"
                      step="50"
                      value={waterInput}
                      onChange={(e) => setWaterInput(e.target.value)}
                      placeholder="Enter amount in ml"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-fitfusion-blue hover:bg-blue-500"
                  >
                    <Plus size={16} className="mr-2" />
                    Log Water
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Today's Intake</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total water:</span>
                      <span className="font-medium">
                        {(diaryEntries
                          .filter(e => e.date === todayDate && e.type === 'water')
                          .reduce((sum, entry) => sum + entry.value, 0) / 1000).toFixed(1)} L
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Daily target:</span>
                      <span className="font-medium">2.5 L</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Steps History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {recentTrackingData.filter(d => d.steps).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
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
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="steps" 
                          name="Steps" 
                          fill="#F97316" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-500 mb-4">No step data available yet.</p>
                      <p className="text-sm text-gray-400">Log your daily steps using the form to the right</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Log Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSteps} className="space-y-4">
                  <div>
                    <label htmlFor="steps" className="block text-sm font-medium mb-1">Steps</label>
                    <Input
                      id="steps"
                      type="number"
                      min="0"
                      value={stepsInput}
                      onChange={(e) => setStepsInput(e.target.value)}
                      placeholder="Enter steps"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-fitfusion-orange hover:bg-orange-500"
                  >
                    <Plus size={16} className="mr-2" />
                    Log Steps
                  </Button>
                </form>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-2">Today's Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total steps:</span>
                      <span className="font-medium">
                        {diaryEntries
                          .filter(e => e.date === todayDate && e.type === 'steps')
                          .reduce((sum, entry) => sum + entry.value, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Daily goal:</span>
                      <span className="font-medium">10,000 steps</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tracker;
