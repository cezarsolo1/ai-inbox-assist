import { useState } from "react";
import { Building2, MapPin, Users, Edit, Wifi, Trash, Car, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockProperties, type Property } from "@/lib/mock-data";
import { Link } from "react-router-dom";

export default function PropertiesPage() {
  const [properties, setProperties] = useState(mockProperties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Property | null>(null);

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setEditData({ ...property });
    setIsEditMode(true);
  };

  const handleSaveProperty = () => {
    if (editData) {
      setProperties(properties.map(p => 
        p.id === editData.id ? editData : p
      ));
      setIsEditMode(false);
      setSelectedProperty(editData);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditData(null);
  };

  const updateEditData = (field: string, value: any) => {
    if (editData) {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setEditData({
          ...editData,
          [parent]: {
            ...editData[parent as keyof Property] as any,
            [child]: value
          }
        });
      } else {
        setEditData({ ...editData, [field]: value });
      }
    }
  };

  return (
    <div className="h-full flex">
      {/* Properties List */}
      <div className="w-1/2 border-r border-border bg-gradient-card">
        <div className="p-6 border-b border-border bg-card">
          <h1 className="text-2xl font-semibold mb-2">Properties</h1>
          <p className="text-muted-foreground">Manage your property portfolio</p>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto">
          {properties.map((property) => (
            <Card 
              key={property.id} 
              className={`cursor-pointer transition-all hover:shadow-medium ${
                selectedProperty?.id === property.id ? 'border-primary shadow-soft' : ''
              }`}
              onClick={() => setSelectedProperty(property)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{property.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {property.address}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProperty(property);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{property.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {property.tenants.length} tenants
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Property Details */}
      <div className="flex-1 bg-background">
        {selectedProperty ? (
          <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="border-b border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedProperty.name}</h2>
                {!isEditMode && (
                  <Button onClick={() => handleEditProperty(selectedProperty)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Property
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {selectedProperty.address}
              </div>
            </div>
            
            {isEditMode && editData ? (
              /* Edit Mode */
              <div className="p-6 space-y-6">
                <div className="flex justify-end gap-2 mb-4">
                  <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  <Button onClick={handleSaveProperty}>Save Changes</Button>
                </div>
                
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Property Name</label>
                        <Input
                          value={editData.name}
                          onChange={(e) => updateEditData('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Address</label>
                        <Input
                          value={editData.address}
                          onChange={(e) => updateEditData('address', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea
                          value={editData.description}
                          onChange={(e) => updateEditData('description', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Property Rules & Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Pet Policy</label>
                        <Textarea
                          value={editData.rules.petPolicy}
                          onChange={(e) => updateEditData('rules.petPolicy', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Trash Schedule</label>
                        <Input
                          value={editData.rules.trashSchedule}
                          onChange={(e) => updateEditData('rules.trashSchedule', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">WiFi Network</label>
                          <Input
                            value={editData.rules.wifiNetwork}
                            onChange={(e) => updateEditData('rules.wifiNetwork', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">WiFi Password</label>
                          <Input
                            value={editData.rules.wifiPassword}
                            onChange={(e) => updateEditData('rules.wifiPassword', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Parking Rules</label>
                        <Textarea
                          value={editData.rules.parkingRules}
                          onChange={(e) => updateEditData('rules.parkingRules', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Property Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedProperty.description}</p>
                  </CardContent>
                </Card>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-primary" />
                        WiFi Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Network:</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {selectedProperty.rules.wifiNetwork}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Password:</span>
                          <span className="ml-2 text-sm text-muted-foreground font-mono">
                            {selectedProperty.rules.wifiPassword}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trash className="w-4 h-4 text-primary" />
                        Trash Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {selectedProperty.rules.trashSchedule}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Car className="w-4 h-4 text-primary" />
                        Parking Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {selectedProperty.rules.parkingRules}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Pet Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {selectedProperty.rules.petPolicy}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Current Tenants
                      <Badge variant="secondary" className="ml-2">
                        {selectedProperty.tenants.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProperty.tenants.length > 0 ? (
                      <div className="space-y-2">
                        {selectedProperty.tenants.map((tenant) => (
                          <div key={tenant.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{tenant.name}</p>
                              <p className="text-sm text-muted-foreground">Unit {tenant.unitNumber}</p>
                            </div>
                            <Link to={`/tenants/${tenant.id}`}>
                              <Button variant="outline" size="sm">View Profile</Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tenants assigned to this property</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Select a Property</h3>
              <p className="text-muted-foreground">Choose a property to view its details and manage settings</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}