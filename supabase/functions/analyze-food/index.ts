
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, apiKey } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Missing image data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Make request to Gemini API for food analysis
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "This is an image of food. Please identify what food is in the image and provide nutritional information in the following JSON format: {\"name\": \"Food Name\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}"
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    });

    const data = await response.json();

    // Extract the JSON from the response text
    let foodData = {};
    try {
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        foodData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (error) {
      console.error("Error parsing response:", error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse food data',
          rawResponse: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify(foodData),
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
