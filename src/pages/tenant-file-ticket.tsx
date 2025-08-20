import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Home, ArrowUpCircle, AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function TenantFileTicket() {
  const { signOut } = useAuth();
  
  const ticketTypes = [
    {
      id: "building",
      icon: Building,
      label: "Building",
      description: "Common areas, lobby, elevators"
    },
    {
      id: "apartment", 
      icon: Home,
      label: "Apartment",
      description: "Issues within your unit"
    },
    {
      id: "staircase",
      icon: ArrowUpCircle,
      label: "Staircase", 
      description: "Stairs, railings, lighting"
    },
    {
      id: "emergency",
      icon: AlertTriangle,
      label: "Emergency",
      description: "Urgent issues requiring immediate attention"
    }
  ];

  const handleTicketType = (typeId: string) => {
    // TODO: Navigate to ticket form with selected type
    console.log("Selected ticket type:", typeId);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold mb-2">File a Ticket</h1>
            <p className="text-muted-foreground">
              Select the category that best describes your issue
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ticketTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={type.id}
                className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => handleTicketType(type.id)}
              >
                <CardContent className="p-6">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-auto flex-col space-y-3 hover:bg-primary/5"
                    onClick={() => handleTicketType(type.id)}
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{type.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}