
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserProfile, Gender, FitnessGoal, DietaryPreference } from '@/types';
import { Save, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Profile = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, updateUserProfile } = useUser();
  
  const [formData, setFormData] = useState<UserProfile>({
    id: userProfile?.id || uuidv4(),
    name: userProfile?.name || '',
    age: userProfile?.age || 30,
    gender: userProfile?.gender || 'prefer-not-to-say',
    height: userProfile?.height || 170,
    weight: userProfile?.weight || 70,
    fitnessGoal: userProfile?.fitnessGoal || 'weight-loss',
    dietaryPreference: userProfile?.dietaryPreference || 'omnivore',
    location: userProfile?.location || '',
    cuisinePreferences: userProfile?.cuisinePreferences || [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userProfile) {
      updateUserProfile(formData);
    } else {
      setUserProfile(formData);
    }
    
    toast.success(userProfile ? 'Profile updated successfully' : 'Profile created successfully', {
      position: 'top-center',
    });
    
    if (!userProfile) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2" />
            {userProfile ? 'Edit Your Profile' : 'Create Your Profile'}
          </CardTitle>
          <CardDescription>
            {userProfile 
              ? 'Update your personal information and preferences' 
              : 'Tell us about yourself so we can personalize your experience'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Personal Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium mb-1">Age</label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium mb-1">Gender</label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleSelectChange('gender', value as Gender)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="height" className="block text-sm font-medium mb-1">Height (cm)</label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    min="50"
                    max="250"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="20"
                    max="500"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Fitness & Diet Preferences</h3>
              
              <div>
                <label htmlFor="fitnessGoal" className="block text-sm font-medium mb-1">Primary Fitness Goal</label>
                <Select 
                  value={formData.fitnessGoal} 
                  onValueChange={(value) => handleSelectChange('fitnessGoal', value as FitnessGoal)}
                >
                  <SelectTrigger id="fitnessGoal">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight-loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="dietaryPreference" className="block text-sm font-medium mb-1">Dietary Preference</label>
                <Select 
                  value={formData.dietaryPreference} 
                  onValueChange={(value) => handleSelectChange('dietaryPreference', value as DietaryPreference)}
                >
                  <SelectTrigger id="dietaryPreference">
                    <SelectValue placeholder="Select diet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="omnivore">Omnivore</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="pescatarian">Pescatarian</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">Location (for localized diet plans)</label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-fitfusion-purple hover:bg-purple-600">
              <Save className="mr-2" />
              {userProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
