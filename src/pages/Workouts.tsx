
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Dumbbell, Clock, Flame, Play, ChevronRight, TrendingUp } from 'lucide-react';

interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  intensity: 'Beginner' | 'Intermediate' | 'Advanced';
  caloriesBurned: number;
  category: string;
  exercises: string[];
}

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: '1',
    title: 'Full Body Strength',
    description: 'A complete full body workout focusing on all major muscle groups',
    duration: 45,
    intensity: 'Intermediate',
    caloriesBurned: 320,
    category: 'Strength',
    exercises: ['Squats', 'Push-ups', 'Deadlifts', 'Shoulder Press', 'Lunges', 'Plank']
  },
  {
    id: '2',
    title: 'HIIT Cardio Blast',
    description: 'High intensity interval training to maximize calorie burn',
    duration: 30,
    intensity: 'Advanced',
    caloriesBurned: 400,
    category: 'Cardio',
    exercises: ['Jumping Jacks', 'Burpees', 'Mountain Climbers', 'High Knees', 'Jump Rope']
  },
  {
    id: '3',
    title: 'Core Crusher',
    description: 'Focus on strengthening your core and abdominal muscles',
    duration: 20,
    intensity: 'Intermediate',
    caloriesBurned: 180,
    category: 'Core',
    exercises: ['Crunches', 'Russian Twists', 'Leg Raises', 'Plank', 'Bicycle Kicks']
  },
  {
    id: '4',
    title: 'Beginner Bodyweight',
    description: 'Perfect routine for beginners using just your bodyweight',
    duration: 30,
    intensity: 'Beginner',
    caloriesBurned: 210,
    category: 'Strength',
    exercises: ['Modified Push-ups', 'Squats', 'Glute Bridges', 'Standing Calf Raises', 'Modified Planks']
  }
];

const Workouts = () => {
  const navigate = useNavigate();
  const { userProfile, isProfileComplete } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredWorkouts = selectedCategory 
    ? workoutTemplates.filter(w => w.category === selectedCategory)
    : workoutTemplates;
  
  const categories = Array.from(new Set(workoutTemplates.map(w => w.category)));

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Profile Required</h2>
          <p className="text-gray-600 mb-6">
            To get personalized workout recommendations, please create your profile first.
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
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-fitfusion-blue to-fitfusion-purple rounded-xl p-6 text-white shadow-lg mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Recommended Workouts
            </h2>
            <p>Personalized for your {userProfile?.fitnessGoal.replace('-', ' ')} goal</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-white text-fitfusion-purple hover:bg-gray-100">
            <TrendingUp size={16} className="mr-2" />
            Get Custom Routine
          </Button>
        </div>
      </section>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className={`cursor-pointer ${selectedCategory === null ? "bg-fitfusion-purple" : ""} hover:bg-fitfusion-purple`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer ${selectedCategory === category ? "bg-fitfusion-purple" : ""} hover:bg-fitfusion-purple`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWorkouts.map(workout => (
          <Card key={workout.id} className="card-hover overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-fitfusion-purple to-fitfusion-blue"></div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <Dumbbell size={18} className="mr-2 text-fitfusion-purple" />
                    {workout.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{workout.description}</CardDescription>
                </div>
                <Badge variant="outline" className="border-fitfusion-purple text-fitfusion-purple">
                  {workout.intensity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-1" />
                  <span>{workout.duration} min</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Flame size={16} className="mr-1 text-fitfusion-orange" />
                  <span>{workout.caloriesBurned} cal</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-medium">Exercises:</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {workout.exercises.map((exercise, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <ChevronRight size={14} className="mr-1 text-fitfusion-purple" />
                      {exercise}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button className="w-full bg-fitfusion-purple hover:bg-purple-600">
                <Play size={16} className="mr-2" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Workouts;
