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
    const { messages, petAnalysis, conversationId } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products to make intelligent recommendations
    const { data: products } = await supabase
      .from('products')
      .select('*');

    console.log('Chat request received, fetched products:', products?.length);

    // Build context-aware system prompt
    const systemPrompt = `You are Pettry, a friendly AI penguin who helps pet owners find the perfect products. You're helpful, warm, and chat like a friend - not a robotic assistant.

Pet Information: ${petAnalysis || 'Not yet provided'}

Available Products:
${products?.map(p => `- ${p.name} ($${p.price}): ${p.description} [Category: ${p.category}, Pet Type: ${p.pet_type}]`).join('\n')}

Chat Style Guidelines:
- Talk naturally like texting a friend, but stay semi-formal
- Use casual phrases like "Hey!", "That's awesome!", "I think", "maybe", "honestly"
- Avoid robotic patterns like "As an AI assistant" or listing things as "1. 2. 3."
- Don't mention categories mechanically - weave them naturally into conversation
- Ask questions that show genuine interest, not formulaic
- Keep responses short (2-3 sentences usually), like real texting
- Use emojis occasionally but don't overdo it

Your approach:
- Ask about the pet's personality, habits, what they enjoy
- When recommending products, explain personally why you think they'd love it
- Sound excited when talking about pets
- After giving recommendations, casually ask if they want to grab any of these

Example good responses:
"Oh your cat sounds super playful! Have you tried any interactive toys? They might really love something that keeps them busy."
"Based on what you said, I think the Premium Cat Food would be perfect - it's got all the nutrients active cats need and most cats actually enjoy the taste!"

Example bad responses (avoid these):
"As a pet care assistant, I recommend the following products: 1. Premium Cat Food 2. Interactive Toys"
"Your pet falls into the active category, so I suggest products from our active pet category."`;


    // Prepare messages for Gemini
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    console.log('Calling Gemini API for chat response...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200,
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I had trouble responding.';

    console.log('Chat response generated:', reply.substring(0, 100));

    // Extract product recommendations from the response
    const recommendedProducts = products?.filter(p => 
      reply.toLowerCase().includes(p.name.toLowerCase())
    ) || [];

    return new Response(
      JSON.stringify({ 
        reply, 
        recommendedProducts: recommendedProducts.slice(0, 3) 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
