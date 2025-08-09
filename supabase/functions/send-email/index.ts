import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, body }: EmailRequest = await req.json();
    
    console.log('Attempting to send email to:', to);

    // SMTP configuration using the provided credentials
    const smtpConfig = {
      hostname: "smtp.gmail.com",
      port: 587,
      username: "solovastrucezar@gmail.com",
      password: "ybelyvxdswmydvlv", // App password
    };

    // Create email message
    const message = `From: ${smtpConfig.username}
To: ${to}
Subject: ${subject}
Content-Type: text/plain; charset=utf-8

${body}`;

    // Send email using SMTP
    const conn = await Deno.connect({
      hostname: smtpConfig.hostname,
      port: smtpConfig.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Read server greeting
    const buffer = new Uint8Array(1024);
    await conn.read(buffer);
    console.log('Server greeting:', decoder.decode(buffer));

    // EHLO command
    await conn.write(encoder.encode(`EHLO localhost\r\n`));
    await conn.read(buffer);
    console.log('EHLO response:', decoder.decode(buffer));

    // STARTTLS command
    await conn.write(encoder.encode(`STARTTLS\r\n`));
    await conn.read(buffer);
    console.log('STARTTLS response:', decoder.decode(buffer));

    // Upgrade to TLS
    const tlsConn = await Deno.startTls(conn, { hostname: smtpConfig.hostname });

    // AUTH LOGIN command
    await tlsConn.write(encoder.encode(`AUTH LOGIN\r\n`));
    await tlsConn.read(buffer);

    // Send username (base64 encoded)
    const username = btoa(smtpConfig.username);
    await tlsConn.write(encoder.encode(`${username}\r\n`));
    await tlsConn.read(buffer);

    // Send password (base64 encoded)
    const password = btoa(smtpConfig.password);
    await tlsConn.write(encoder.encode(`${password}\r\n`));
    await tlsConn.read(buffer);

    // MAIL FROM command
    await tlsConn.write(encoder.encode(`MAIL FROM:<${smtpConfig.username}>\r\n`));
    await tlsConn.read(buffer);

    // RCPT TO command
    await tlsConn.write(encoder.encode(`RCPT TO:<${to}>\r\n`));
    await tlsConn.read(buffer);

    // DATA command
    await tlsConn.write(encoder.encode(`DATA\r\n`));
    await tlsConn.read(buffer);

    // Send message
    await tlsConn.write(encoder.encode(`${message}\r\n.\r\n`));
    await tlsConn.read(buffer);

    // QUIT command
    await tlsConn.write(encoder.encode(`QUIT\r\n`));
    
    tlsConn.close();

    console.log('✅ Email sent successfully!');

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);