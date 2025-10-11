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
    const systemPrompt = `You are PawPal, a friendly pet store assistant. 
    
Pet Information: ${petAnalysis || 'Not yet provided'}

Available Products:
${products?.map(p => `- ${p.name} ($${p.price}): ${p.description} [Category: ${p.category}, Pet Type: ${p.pet_type}]`).join('\n')}

Your role:
1. Ask 2-3 relevant questions about the pet's lifestyle, dietary needs, or current challenges
2. Make personalized product recommendations based on their answers
3. Be warm, enthusiastic, and knowledgeable about pet care
4. When recommending products, explain WHY they're perfect for this specific pet
5. After providing recommendations, ask if they'd like to add items to cart

Important: Keep responses conversational and concise (2-3 sentences max). Focus on building rapport and understanding the pet's needs.`;

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
