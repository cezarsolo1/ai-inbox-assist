import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TicketIcon } from "lucide-react";

export default function TenantWelcome() {
  const navigate = useNavigate();

  const handleFileTicket = () => {
    navigate("/tenant/file-ticket");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TicketIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome, Tenant!</h1>
              <p className="text-muted-foreground">
                Need help with your property? File a ticket and we'll assist you promptly.
              </p>
            </div>
            
            <Button 
              onClick={handleFileTicket}
              size="lg"
              className="w-full h-14 text-lg font-semibold"
            >
              File a Ticket
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}