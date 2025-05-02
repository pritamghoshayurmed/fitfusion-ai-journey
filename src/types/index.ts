
export type Gender = "male" | "female" | "other" | "prefer-not-to-say";

export type FitnessGoal = 
  | "weight-loss"
  | "muscle-gain"
  | "maintenance"
  | "endurance"
  | "flexibility";

export type DietaryPreference = 
  | "omnivore" 
  | "vegetarian" 
  | "vegan" 
  | "pescatarian"
  | "keto"
  | "paleo";

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
  fitnessGoal: FitnessGoal;
  dietaryPreference: DietaryPreference;
  location?: string;
  cuisinePreferences?: string[];
}

export interface TrackingData {
  date: string;
  weight?: number;
  caloriesConsumed?: number;
  caloriesBurned?: number;
  waterIntake?: number; // in ml
  steps?: number;
}

export interface DiaryEntry {
  id: string;
  date: string;
  type: "food" | "workout" | "water" | "steps";
  value: number;
  notes?: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

export interface Workout {
  name: string;
  duration: number; // in minutes
  caloriesBurned: number;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number; // in minutes
  distance?: number; // in km
}
