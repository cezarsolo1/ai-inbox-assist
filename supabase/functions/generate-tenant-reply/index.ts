import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gmail API configuration
const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1';
const EMAIL_ACCOUNT = "solovastrucezar@gmail.com";

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
const GMAIL_REFRESH_TOKEN = Deno.env.get('GMAIL_REFRESH_TOKEN');

function extractLatestReply(body: string): string {
  /**
   * Removes quoted text and keeps only the latest reply.
   */
  const separators = [
    "\nOn ",                       
    "\n-----Original Message-----", 
    "\nFrom:",
    "\n>",
    "wrote:"
  ];
  
  for (const sep of separators) {
    if (body.includes(sep)) {
      body = body.split(sep)[0];
      break;
    }
  }
  
  // Remove quoted lines starting with >
  const lines = body.split('\n').filter(line => !line.trim().startsWith(">"));
  return lines.join('\n').trim();
}

function decodeBase64Url(str: string): string {
  // Convert base64url to base64
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (str.length % 4) {
    str += '=';
  }
  try {
    return atob(str);
  } catch (e) {
    console.error('Error decoding base64:', e);
    return str;
  }
}

async function getAccessToken(): Promise<string> {
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    throw new Error('Missing Gmail OAuth secrets');
  }

  const params = new URLSearchParams({
    client_id: GMAIL_CLIENT_ID,
    client_secret: GMAIL_CLIENT_SECRET,
    refresh_token: GMAIL_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });

  const resp = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed: ${resp.status} ${resp.statusText} - ${text}`);
  }

  const json = await resp.json();
  if (!json.access_token) throw new Error('No access_token in response');
  return json.access_token as string;
}

async function getLatestEmail(): Promise<string> {
  try {
    const accessToken = await getAccessToken();
    console.log('Access token retrieved successfully');

    // Get list of messages (latest inbox message)
    const messagesResponse = await fetch(`${GMAIL_API_URL}/users/me/messages?maxResults=1&q=in:inbox`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!messagesResponse.ok) {
      const errText = await messagesResponse.text();
      throw new Error(`Gmail API error (list): ${messagesResponse.status} ${messagesResponse.statusText} - ${errText}`);
    }

    const messagesData = await messagesResponse.json();
    
    if (!messagesData.messages || messagesData.messages.length === 0) {
      throw new Error('No messages found in inbox');
    }

    const messageId = messagesData.messages[0].id;

    // Get the full message
    const messageResponse = await fetch(`${GMAIL_API_URL}/users/me/messages/${messageId}?format=full`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!messageResponse.ok) {
      const errText = await messageResponse.text();
      throw new Error(`Gmail API error (get): ${messageResponse.status} ${messageResponse.statusText} - ${errText}`);
    }

    const messageData = await messageResponse.json();
    
    // Extract body from the message
    let body = '';
    
    function extractBody(part: any): string {
      if (part.body && part.body.data) {
        return decodeBase64Url(part.body.data);
      }
      
      if (part.parts) {
        for (const subPart of part.parts) {
          if (subPart.mimeType === 'text/plain' && subPart.body && subPart.body.data) {
            return decodeBase64Url(subPart.body.data);
          }
        }
        // If no text/plain found, try the first part
        if (part.parts[0]) {
          return extractBody(part.parts[0]);
        }
      }
      
      return '';
    }
    
    body = extractBody(messageData.payload);
    
    if (!body) {
      throw new Error('Could not extract email body');
    }

    return extractLatestReply(body);
      
  } catch (error) {
    console.error('Error reading Gmail:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Attempting to read latest email from Gmail API...');
    
    const emailBody = await getLatestEmail();
    
    if (!emailBody || emailBody.trim().length === 0) {
      throw new Error('No email content found or email is empty');
    }
    
    console.log('Email body extracted successfully:', emailBody.substring(0, 100) + '...');

    return new Response(JSON.stringify({ reply: emailBody }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-tenant-reply function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});