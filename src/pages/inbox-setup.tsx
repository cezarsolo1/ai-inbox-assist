import { Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function InboxSetupPage() {
  const { toast } = useToast();

  const jsonPayload = `{
  "channel": "whatsapp",
  "from_msisdn": "{{1.query.From.replace('whatsapp:','')}}",
  "to_msisdn": "{{1.query.To.replace('whatsapp:','')}}",
  "body": "{{1.query.Body}}",
  "profile_name": "{{1.query.ProfileName}}",
  "twilio_sid": "{{1.query.MessageSid}}",
  "media": ["{{1.query.MediaUrl0}}","{{1.query.MediaUrl1}}","{{1.query.MediaUrl2}}"],
  "raw": {{1.query}}
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonPayload);
    toast({
      title: "Copied!",
      description: "JSON payload copied to clipboard",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/inbox">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inbox
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Inbox Setup - Make.com Integration</h1>
      </div>

      {/* Instructions */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Make.com Webhook Configuration</h2>
          <p className="text-muted-foreground mb-4">
            To receive WhatsApp messages in your inbox, configure Make.com to POST the following JSON
            to your Supabase database using the "Insert Row" action.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Target Table</h3>
              <code className="text-sm bg-muted px-2 py-1 rounded">inbox_messages</code>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. JSON Payload</h3>
              <div className="relative">
                <pre className="text-sm bg-muted p-4 rounded overflow-x-auto border">
                  {jsonPayload}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Field Notes</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><code>NumMedia</code> is a string; include the first 3 MediaUrl* fields</li>
                <li>Empty media URLs will be ignored by the UI</li>
                <li>The <code>raw</code> field captures the complete webhook payload</li>
                <li>Phone numbers automatically strip the "whatsapp:" prefix</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase Configuration</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Database Access</h3>
              <p className="text-sm text-muted-foreground">
                Make sure to use your Supabase <strong>service role key</strong> (not the anon key) 
                in Make.com for write operations to the inbox_messages table.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Webhook URL</h3>
              <p className="text-sm text-muted-foreground">
                Set up your Twilio WhatsApp webhook to trigger your Make.com scenario 
                whenever a new message is received.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Testing</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              After setting up the integration:
            </p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Send a WhatsApp message to your Twilio number</li>
              <li>Check that the Make.com scenario triggers</li>
              <li>Verify the message appears in your inbox</li>
              <li>Test media attachments if needed</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}