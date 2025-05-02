
-- Create table for diet plans
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    description TEXT,
    target_calories INTEGER NOT NULL,
    cuisine TEXT NOT NULL,
    days JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for diet_plans
CREATE POLICY "Users can view their own diet plans" 
ON public.diet_plans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diet plans" 
ON public.diet_plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diet plans" 
ON public.diet_plans FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diet plans" 
ON public.diet_plans FOR DELETE 
USING (auth.uid() = user_id);
