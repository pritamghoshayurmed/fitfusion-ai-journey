
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { Plus, Utensils, Clock, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DietPlan, DietPlanDay, DietPlanMeal } from '@/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DietPlanPage = () => {
  const navigate = useNavigate();
  const { userProfile, isProfileComplete, user } = useUser();
  const [cuisine, setCuisine] = useState('');
  const [calories, setCalories] = useState('2000');
  const [timeframe, setTimeframe] = useState('4');
  const [currentWeight, setCurrentWeight] = useState(userProfile?.weight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [activeDay, setActiveDay] = useState("Day 1");

  // Fetch saved diet plans from Supabase
  const { data: savedPlans, isLoading: isLoadingPlans, refetch: refetchPlans } = useQuery({
    queryKey: ['dietPlans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Add a new diet plan to Supabase
  const savePlanMutation = useMutation({
    mutationFn: async (dietPlan: DietPlan) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('diet_plans')
        .insert({
          user_id: user.id,
          plan_name: dietPlan.planName,
          description: dietPlan.description,
          target_calories: dietPlan.targetCalories,
          cuisine: dietPlan.cuisine,
          days: dietPlan.days
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Diet plan saved successfully!');
      refetchPlans();
    },
    onError: (error) => {
      toast.error(`Failed to save diet plan: ${error.message}`);
    }
  });

  // Generate diet plan with Gemini API
  const generateDietPlan = async () => {
    if (!cuisine || !calories) {
      toast.error('Please select a cuisine type and specify daily calories');
      return;
    }

    setIsGenerating(true);

    try {
      // Call the Supabase Edge Function to generate the diet plan
      const response = await supabase.functions.invoke('generate-diet-plan', {
        body: {
          cuisine,
          calories,
          dietaryPreference: userProfile?.dietaryPreference || 'omnivore',
          timeframe: parseInt(timeframe),
          currentWeight: currentWeight ? parseFloat(currentWeight) : undefined,
          targetWeight: targetWeight ? parseFloat(targetWeight) : undefined
        }
      });
      
      if (response.error) {
        console.error("Error from edge function:", response.error);
        throw new Error(response.error.message || 'Error generating diet plan');
      }
      
      const dietPlanData = response.data;
      
      // Set the selected plan to display it
      setSelectedPlan({
        ...dietPlanData,
        cuisine
      });
      
      toast.success("Diet plan generated successfully!");
    } catch (error: any) {
      console.error('Error generating diet plan:', error);
      toast.error(error.message || 'Failed to generate diet plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = () => {
    if (!selectedPlan) return;
    savePlanMutation.mutate(selectedPlan);
  };

  const renderDaySelector = () => {
    if (!selectedPlan?.days) return null;
    
    return (
      <Tabs defaultValue={activeDay} onValueChange={setActiveDay}>
        <TabsList className="grid grid-flow-col auto-cols-fr mb-4">
          {selectedPlan.days.map((day, index) => (
            <TabsTrigger key={index} value={day.day}>
              {day.day}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  };

  const renderDayMeals = () => {
    if (!selectedPlan?.days) return null;
    
    const currentDay = selectedPlan.days.find(day => day.day === activeDay);
    if (!currentDay) return null;
    
    return (
      <div className="space-y-6">
        {currentDay.meals.map((meal, index) => (
          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-start">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4
                ${meal.type === 'breakfast' ? 'bg-yellow-100 text-yellow-600' : ''}
                ${meal.type === 'lunch' ? 'bg-green-100 text-green-600' : ''}
                ${meal.type === 'dinner' ? 'bg-blue-100 text-blue-600' : ''}
                ${meal.type === 'snack' ? 'bg-purple-100 text-purple-600' : ''}
              `}>
                <Utensils size={20} />
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-medium">{meal.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Calories:</span>
                    <span className="ml-1 text-sm">{meal.calories}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Protein:</span>
                    <span className="ml-1 text-sm">{meal.protein}g</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Carbs:</span>
                    <span className="ml-1 text-sm">{meal.carbs}g</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Fat:</span>
                    <span className="ml-1 text-sm">{meal.fat}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between items-center py-3 px-4 bg-gray-100 rounded-lg mt-6">
          <div className="font-medium">Total Calories</div>
          <div className="text-xl font-bold">{currentDay.totalCalories} kcal</div>
        </div>
      </div>
    );
  };

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Profile Required</h2>
          <p className="text-gray-600 mb-6">
            To get personalized diet plans, please create your profile first.
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
      {/* Diet Plan Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate AI Diet Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium mb-2">Preferred Cuisine</label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger id="cuisine">
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="calories" className="block text-sm font-medium mb-2">Daily Calories</label>
              <Input 
                id="calories" 
                type="number" 
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                step="100" 
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="currentWeight" className="block text-sm font-medium mb-2">Current Weight (kg)</label>
              <Input 
                id="currentWeight" 
                type="number" 
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                step="0.1" 
              />
            </div>
            
            <div>
              <label htmlFor="targetWeight" className="block text-sm font-medium mb-2">Target Weight (kg)</label>
              <Input 
                id="targetWeight" 
                type="number" 
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                step="0.1" 
              />
            </div>
            
            <div>
              <label htmlFor="timeframe" className="block text-sm font-medium mb-2">Timeframe (weeks)</label>
              <Input 
                id="timeframe" 
                type="number" 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                min="1"
                step="1" 
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              className="bg-fitfusion-purple hover:bg-purple-600"
              onClick={generateDietPlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate Plan</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Diet Plan */}
      {selectedPlan && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedPlan.planName}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{selectedPlan.description}</p>
            </div>
            <Button 
              onClick={handleSavePlan} 
              className="bg-fitfusion-purple hover:bg-purple-600"
              disabled={savePlanMutation.isPending}
            >
              {savePlanMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Save Plan
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {renderDaySelector()}
            {renderDayMeals()}
          </CardContent>
        </Card>
      )}
      
      {/* My Diet Plans */}
      <Card>
        <CardHeader>
          <CardTitle>My Diet Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPlans ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-fitfusion-purple" />
            </div>
          ) : savedPlans && savedPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlans.map((plan, idx) => (
                <Card key={idx} className="card-hover overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-2">
                    <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                    <p className="text-sm text-gray-500">{plan.cuisine} cuisine</p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm line-clamp-2 mb-4">{plan.description}</p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Utensils size={16} className="mr-1 text-fitfusion-purple" />
                        <span>{plan.target_calories} kcal/day</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1 text-fitfusion-purple" />
                        <span>{plan.days?.length || 7} days</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4 bg-fitfusion-purple hover:bg-purple-600"
                      onClick={() => {
                        setSelectedPlan({
                          id: plan.id,
                          planName: plan.plan_name,
                          description: plan.description,
                          targetCalories: plan.target_calories,
                          cuisine: plan.cuisine,
                          days: plan.days,
                          createdAt: plan.created_at,
                          userId: plan.user_id
                        });
                        setActiveDay("Day 1");
                      }}
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No saved diet plans yet. Generate and save plans to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Diet Plans (kept for reference) */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Sample Diet Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dietPlans.map((plan, index) => (
          <Card key={index} className="card-hover">
            <CardHeader>
              <CardTitle>{plan.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.meals.map((meal, mealIndex) => (
                  <div key={mealIndex} className="flex items-start p-3 border rounded-lg hover:bg-gray-50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3
                      ${meal.type === 'Breakfast' ? 'bg-yellow-100 text-yellow-600' : ''}
                      ${meal.type === 'Lunch' ? 'bg-green-100 text-green-600' : ''}
                      ${meal.type === 'Dinner' ? 'bg-blue-100 text-blue-600' : ''}
                      ${meal.type === 'Snack' ? 'bg-purple-100 text-purple-600' : ''}
                    `}>
                      <Utensils size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock size={14} className="mr-1" /> {meal.type}
                        <span className="ml-3">{meal.calories} kcal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" className="text-fitfusion-purple border-fitfusion-purple">
                  View Details
                </Button>
                <Button className="bg-fitfusion-purple hover:bg-purple-600">
                  <Plus size={16} className="mr-2" />
                  Add to My Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DietPlanPage;
