import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InboxMessage {
  channel: string;
  message: {
    from_msisdn: string;
    to_msisdn: string;
    body?: string;
    profile_name?: string;
    twilio_sid?: string;
  };
  media?: string[];
  raw?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: InboxMessage = await req.json();
    console.log('Received message data:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.channel || !data.message?.from_msisdn || !data.message?.to_msisdn) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: channel, message.from_msisdn, message.to_msisdn' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Insert into inbox_messages table
    const { data: insertedMessage, error } = await supabase
      .from('inbox_messages')
      .insert({
        channel: data.channel,
        from_msisdn: data.message.from_msisdn,
        to_msisdn: data.message.to_msisdn,
        body: data.message.body || null,
        profile_name: data.message.profile_name || null,
        twilio_sid: data.message.twilio_sid || null,
        media: data.media || [],
        raw: data.raw || null,
        seen: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Failed to insert message', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Message inserted successfully:', insertedMessage.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Message inserted successfully',
      id: insertedMessage.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in inbox-intake function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);