import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAP_SERVER = "imap.gmail.com";
const EMAIL_ACCOUNT = "solovastrucezar@gmail.com";
const APP_PASSWORD = "ybelyvxdswmydvlv";

function extractLatestReply(body: string): string {
  /**
   * Removes quoted text and keeps only the latest reply.
   */
  const separators = [
    "\nOn ",                       
    "\n-----Original Message-----", 
    "\nFrom:"                       
  ];
  
  for (const sep of separators) {
    if (body.includes(sep)) {
      body = body.split(sep)[0];
      break;
    }
  }
  
  // Remove quoted lines
  const lines = body.split('\n').filter(line => !line.trim().startsWith(">"));
  return lines.join('\n').trim();
}

async function readLastEmailBody(): Promise<string> {
  try {
    // Connect to IMAP server using TLS
    const conn = await Deno.connectTls({
      hostname: IMAP_SERVER,
      port: 993,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to send command and read response
    async function sendCommand(command: string): Promise<string> {
      await conn.write(encoder.encode(command + '\r\n'));
      const buffer = new Uint8Array(4096);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    }

    // Login sequence
    await sendCommand(`A001 LOGIN ${EMAIL_ACCOUNT} ${APP_PASSWORD}`);
    
    // Select inbox
    await sendCommand('A002 SELECT INBOX');
    
    // Search for all messages
    const searchResponse = await sendCommand('A003 SEARCH ALL');
    
    // Extract message IDs from search response
    const messageIds = searchResponse.match(/\* SEARCH (.+)/)?.[1]?.trim().split(' ') || [];
    
    if (messageIds.length === 0) {
      conn.close();
      return "";
    }
    
    // Get the last message ID
    const lastMessageId = messageIds[messageIds.length - 1];
    
    // Fetch the last email
    const fetchResponse = await sendCommand(`A004 FETCH ${lastMessageId} (BODY[TEXT])`);
    
    // Extract body content from IMAP response
    const bodyMatch = fetchResponse.match(/BODY\[TEXT\]\s*{[^}]+}\s*(.+?)(?=\r?\nA004)/s);
    
    conn.close();
    
    if (bodyMatch && bodyMatch[1]) {
      const body = bodyMatch[1].trim();
      return extractLatestReply(body);
    }
    
    return "";
    
  } catch (error) {
    console.error('Error reading email:', error);
    return "";
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Attempting to read latest email...');
    
    const emailBody = await readLastEmailBody();
    
    if (!emailBody) {
      throw new Error('No email content found');
    }
    
    console.log('Email body extracted:', emailBody.substring(0, 100) + '...');

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