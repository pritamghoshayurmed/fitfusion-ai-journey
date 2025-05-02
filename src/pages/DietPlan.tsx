
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { Plus, Utensils, Clock } from 'lucide-react';

const DietPlan = () => {
  const navigate = useNavigate();
  const { userProfile, isProfileComplete } = useUser();
  const [cuisine, setCuisine] = useState('');

  const dietPlans = [
    {
      title: 'Balanced Mediterranean',
      meals: [
        { name: 'Greek yogurt with honey and berries', calories: 320, type: 'Breakfast' },
        { name: 'Quinoa salad with chickpeas and vegetables', calories: 450, type: 'Lunch' },
        { name: 'Grilled fish with roasted vegetables', calories: 520, type: 'Dinner' },
        { name: 'Mixed nuts and dried fruits', calories: 180, type: 'Snack' },
      ]
    },
    {
      title: 'High Protein Plan',
      meals: [
        { name: 'Egg white omelette with spinach and turkey', calories: 350, type: 'Breakfast' },
        { name: 'Grilled chicken breast with sweet potato', calories: 480, type: 'Lunch' },
        { name: 'Baked salmon with asparagus', calories: 550, type: 'Dinner' },
        { name: 'Protein shake with banana', calories: 220, type: 'Snack' },
      ]
    }
  ];

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
          <CardTitle>Generate Diet Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
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
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="calories" className="block text-sm font-medium mb-2">Daily Calories</label>
              <Input id="calories" type="number" defaultValue="2000" step="100" />
            </div>
            
            <div className="flex items-end">
              <Button className="w-full bg-fitfusion-purple hover:bg-purple-600">
                Generate Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Diet Plans */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Recommended For You</h2>
      
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

export default DietPlan;
