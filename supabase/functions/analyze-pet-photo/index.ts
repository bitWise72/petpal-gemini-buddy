import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = await req.json();
    const { imageData } = body;
    
    if (!imageData || typeof imageData !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid image data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!imageData.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (imageData.length > 10_000_000) {
      return new Response(JSON.stringify({ error: 'Image too large. Maximum size is 10MB' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing pet photo with Gemini Vision...');

    // Call Gemini API for vision analysis with structured output
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Analyze this pet image and provide both a friendly conversational response and detailed structured data." },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData.split(',')[1]
                }
              }
            ]
          }],
          tools: [
            {
              function_declarations: [
                {
                  name: "analyze_pet",
                  description: "Analyze a pet photo and return both friendly message and structured details",
                  parameters: {
                    type: "object",
                    properties: {
                      friendlyMessage: {
                        type: "string",
                        description: "A warm, friendly, conversational response about the pet (e.g., 'Hey, that's your husky, right? It looks beautiful with its blue eyes!')"
                      },
                      petDetails: {
                        type: "object",
                        description: "Structured data about the pet",
                        properties: {
                          type: { type: "string", description: "Pet type (dog, cat, bird, etc.)" },
                          breed: { type: "string", description: "Breed if recognizable, otherwise 'Unknown'" },
                          age: { type: "string", description: "Approximate age (puppy/kitten, young adult, adult, senior)" },
                          size: { type: "string", description: "Size category (small, medium, large)" },
                          health: { type: "string", description: "Visible health indicators or 'appears healthy'" },
                          characteristics: {
                            type: "array",
                            items: { type: "string" },
                            description: "Notable characteristics (coat color, eye color, distinctive features)"
                          },
                          additionalDetails: { type: "string", description: "Any other relevant observations" }
                        },
                        required: ["type", "breed", "age", "size", "health", "characteristics"]
                      }
                    },
                    required: ["friendlyMessage", "petDetails"]
                  }
                }
              ]
            }
          ],
          tool_config: {
            function_calling_config: {
              mode: "ANY",
              allowed_function_names: ["analyze_pet"]
            }
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error, 'Status:', response.status);
      return new Response(JSON.stringify({ error: 'Failed to analyze image. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    // Extract the function call response
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    if (!functionCall || functionCall.name !== 'analyze_pet') {
      console.error('Unexpected response format:', JSON.stringify(data));
      return new Response(JSON.stringify({ error: 'Failed to analyze pet. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { friendlyMessage, petDetails } = functionCall.args;

    console.log('Pet analysis completed:', friendlyMessage);
    console.log('Structured details:', JSON.stringify(petDetails));

    return new Response(JSON.stringify({ 
      analysis: friendlyMessage,
      petDetails 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-pet-photo:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
