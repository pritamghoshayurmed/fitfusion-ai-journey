
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { Dumbbell, Clock, Flame, Play, ChevronRight, TrendingUp, CheckCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

interface ActiveWorkout {
  template: WorkoutTemplate;
  currentExerciseIndex: number;
  startTime: Date;
  completed: boolean;
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
  const { userProfile, isProfileComplete, isAuthenticated, user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);

  const filteredWorkouts = selectedCategory 
    ? workoutTemplates.filter(w => w.category === selectedCategory)
    : workoutTemplates;
  
  const categories = Array.from(new Set(workoutTemplates.map(w => w.category)));

  useEffect(() => {
    // If user is authenticated, fetch their completed workout history
    if (isAuthenticated && user) {
      fetchCompletedWorkouts();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Timer for active workout
    let interval: NodeJS.Timeout | null = null;
    
    if (activeWorkout && !activeWorkout.completed) {
      interval = setInterval(() => {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - activeWorkout.startTime.getTime()) / 1000);
        setElapsedTime(seconds);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeWorkout]);

  const fetchCompletedWorkouts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workout_history')
        .select('workout_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setCompletedWorkouts(data.map(item => item.workout_id));
      }
    } catch (error) {
      console.error('Error fetching completed workouts:', error);
    }
  };

  const handleStartWorkout = (workout: WorkoutTemplate) => {
    setActiveWorkout({
      template: workout,
      currentExerciseIndex: 0,
      startTime: new Date(),
      completed: false
    });
    setWorkoutDialogOpen(true);
    setElapsedTime(0);
  };

  const handleNextExercise = () => {
    if (!activeWorkout) return;
    
    if (activeWorkout.currentExerciseIndex < activeWorkout.template.exercises.length - 1) {
      setActiveWorkout({
        ...activeWorkout,
        currentExerciseIndex: activeWorkout.currentExerciseIndex + 1
      });
    } else {
      // Workout completed
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    if (!activeWorkout) return;
    
    setActiveWorkout({
      ...activeWorkout,
      completed: true
    });
    
    toast.success(`Congratulations! You completed the ${activeWorkout.template.title} workout!`);
    
    // If user is authenticated, save the workout to history
    if (isAuthenticated && user) {
      try {
        const { error } = await supabase
          .from('workout_history')
          .insert({
            user_id: user.id,
            workout_id: activeWorkout.template.id,
            duration: Math.floor(elapsedTime / 60), // Convert seconds to minutes
            calories_burned: activeWorkout.template.caloriesBurned,
            notes: `Completed ${activeWorkout.template.exercises.length} exercises`
          });
        
        if (error) throw error;
        
        // Update local state with newly completed workout
        if (!completedWorkouts.includes(activeWorkout.template.id)) {
          setCompletedWorkouts([...completedWorkouts, activeWorkout.template.id]);
        }
      } catch (error) {
        console.error('Error saving workout history:', error);
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in or sign up to access workouts.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-fitfusion-purple hover:bg-purple-600"
          >
            Log In / Sign Up
          </Button>
        </div>
      </div>
    );
  }

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
            <p>Personalized for your {userProfile?.fitnessGoal?.replace('-', ' ')} goal</p>
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
        {filteredWorkouts.map(workout => {
          const isCompleted = completedWorkouts.includes(workout.id);
          
          return (
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
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <Badge variant="secondary" className="border-green-500 text-green-500 flex items-center gap-1">
                        <CheckCircle size={14} />
                        Done
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-fitfusion-purple text-fitfusion-purple">
                      {workout.intensity}
                    </Badge>
                  </div>
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
                
                <Button 
                  className="w-full bg-fitfusion-purple hover:bg-purple-600"
                  onClick={() => handleStartWorkout(workout)}
                >
                  <Play size={16} className="mr-2" />
                  {isCompleted ? 'Repeat Workout' : 'Start Workout'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Workout Dialog */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeWorkout?.completed 
                ? 'Workout Completed!' 
                : activeWorkout?.template.title || 'Workout'}
            </DialogTitle>
            <DialogDescription>
              {activeWorkout?.completed
                ? `Great job! You burned approximately ${activeWorkout.template.caloriesBurned} calories.`
                : `Exercise ${activeWorkout ? activeWorkout.currentExerciseIndex + 1 : 0} of ${activeWorkout?.template.exercises.length || 0}`
              }
            </DialogDescription>
          </DialogHeader>

          {activeWorkout && !activeWorkout.completed && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">
                  {activeWorkout.template.exercises[activeWorkout.currentExerciseIndex]}
                </h3>
                <p className="text-sm text-gray-500">
                  Complete this exercise before moving to the next one
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {activeWorkout.currentExerciseIndex + 1}/{activeWorkout.template.exercises.length}
                  </span>
                </div>
                <Progress 
                  value={(activeWorkout.currentExerciseIndex + 1) / activeWorkout.template.exercises.length * 100} 
                  className="h-2" 
                />
              </div>
              
              <div className="flex justify-center text-xl font-mono">
                {formatTime(elapsedTime)}
              </div>
            </div>
          )}

          {activeWorkout?.completed ? (
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="text-5xl text-green-500 mb-4">🎉</div>
              <p className="text-center">
                Well done! You completed the workout in {formatTime(elapsedTime)}
              </p>
            </div>
          ) : null}

          <DialogFooter className="flex sm:justify-between">
            {!activeWorkout?.completed ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setWorkoutDialogOpen(false);
                    setActiveWorkout(null);
                  }}
                >
                  <X size={16} className="mr-2" />
                  Quit
                </Button>
                <Button onClick={handleNextExercise}>
                  {activeWorkout && activeWorkout.currentExerciseIndex === activeWorkout.template.exercises.length - 1
                    ? 'Complete Workout'
                    : 'Next Exercise'
                  }
                </Button>
              </>
            ) : (
              <DialogClose asChild>
                <Button className="w-full">Close</Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workouts;
