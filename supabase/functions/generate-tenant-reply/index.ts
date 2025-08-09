import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gmail API configuration
const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1';
const EMAIL_ACCOUNT = "solovastrucezar@gmail.com";

// You'll need to get this from Google Cloud Console
const GMAIL_ACCESS_TOKEN = Deno.env.get('GMAIL_ACCESS_TOKEN');

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

async function getLatestEmail(): Promise<string> {
  if (!GMAIL_ACCESS_TOKEN) {
    throw new Error('Gmail access token not configured');
  }

  try {
    // Get list of messages
    const messagesResponse = await fetch(`${GMAIL_API_URL}/users/me/messages?maxResults=1&q=in:inbox`, {
      headers: {
        'Authorization': `Bearer ${GMAIL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!messagesResponse.ok) {
      throw new Error(`Gmail API error: ${messagesResponse.status} ${messagesResponse.statusText}`);
    }

    const messagesData = await messagesResponse.json();
    
    if (!messagesData.messages || messagesData.messages.length === 0) {
      throw new Error('No messages found in inbox');
    }

    const messageId = messagesData.messages[0].id;

    // Get the full message
    const messageResponse = await fetch(`${GMAIL_API_URL}/users/me/messages/${messageId}?format=full`, {
      headers: {
        'Authorization': `Bearer ${GMAIL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!messageResponse.ok) {
      throw new Error(`Gmail API error: ${messageResponse.status} ${messageResponse.statusText}`);
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