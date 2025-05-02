
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = "AIzaSyDl4xzZEbn7xdh8j3b8A3ALLty30oI1Txg";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cuisine, calories, dietaryPreference, timeframe, currentWeight, targetWeight } = await req.json();

    if (!cuisine || !calories) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate daily deficit/surplus based on weight goals and timeframe
    let calorieAdjustment = 0;
    let planDescription = "";
    
    if (currentWeight && targetWeight && timeframe) {
      const weightDifference = targetWeight - currentWeight;
      const dailyCalorieDiff = (weightDifference * 7700) / (timeframe * 7); // 7700 calories ≈ 1kg, timeframe in weeks
      calorieAdjustment = dailyCalorieDiff;
      
      if (weightDifference > 0) {
        planDescription = `This plan is designed to help you gain ${weightDifference}kg over ${timeframe} weeks with a caloric surplus of ${Math.abs(Math.round(dailyCalorieDiff))} calories per day.`;
      } else if (weightDifference < 0) {
        planDescription = `This plan is designed to help you lose ${Math.abs(weightDifference)}kg over ${timeframe} weeks with a caloric deficit of ${Math.abs(Math.round(dailyCalorieDiff))} calories per day.`;
      } else {
        planDescription = "This plan is designed to maintain your current weight.";
      }
    }

    const adjustedCalories = parseInt(calories) + calorieAdjustment;

    // Create prompt for Gemini API
    const prompt = `
    Create a detailed 7-day diet plan for someone who:
    - Prefers ${cuisine} cuisine
    - Needs approximately ${adjustedCalories} calories per day
    - Has ${dietaryPreference || 'no specific'} dietary preferences
    ${planDescription ? `- ${planDescription}` : ''}
    
    For each day, provide exactly 4 meals: breakfast, lunch, dinner, and a snack.
    For each meal, include:
    1. The meal name
    2. Exact calories
    3. Macronutrients (protein, carbs, fat in grams)
    4. A brief description
    
    Return the response in the following JSON format:
    {
      "planName": "A creative name for this diet plan",
      "description": "${planDescription || 'A personalized diet plan based on your preferences'}",
      "targetCalories": ${adjustedCalories},
      "days": [
        {
          "day": "Day 1",
          "meals": [
            {
              "name": "Meal name",
              "type": "breakfast|lunch|dinner|snack",
              "calories": 000,
              "protein": 00,
              "carbs": 00,
              "fat": 00,
              "description": "Brief description"
            }
          ],
          "totalCalories": 0000
        }
      ]
    }
    
    Make sure the plan is nutritionally balanced and the total calories across all meals each day approximately matches the target calories.
    Only return valid JSON without any additional text or explanations.`;

    console.log("Sending request to Gemini API with prompt:", prompt);

    // Make request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    });

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error("Invalid response from Gemini API:", data);
      throw new Error("Failed to generate diet plan");
    }

    // Extract the JSON content from the response text
    let dietPlan = {};
    try {
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        dietPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (error) {
      console.error("Error parsing Gemini API response:", error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse diet plan data',
          rawResponse: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify(dietPlan),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
