import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { User, Mail, Phone, Building2, Calendar, DollarSign, PawPrint, Plus, Edit, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mockTenants, type Tenant, type TenantNote } from "@/lib/mock-data";

const formatDate = (date: Date) => {
  return date.toLocaleDateString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export default function TenantsPage() {
  const { id } = useParams<{ id: string }>();
  const [tenants, setTenants] = useState(mockTenants);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(
    id ? tenants.find(t => t.id === id) || null : null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Tenant | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isAddingTenant, setIsAddingTenant] = useState(false);

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditData({ ...tenant });
    setIsEditMode(true);
  };

  const handleSaveTenant = () => {
    if (editData) {
      if (isAddingTenant) {
        handleSaveNewTenant();
      } else {
        setTenants(tenants.map(t => 
          t.id === editData.id ? editData : t
        ));
        setIsEditMode(false);
        setSelectedTenant(editData);
      }
    }
  };

  const handleCancelEdit = () => {
    if (isAddingTenant) {
      handleCancelAddTenant();
    } else {
      setIsEditMode(false);
      setEditData(null);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && selectedTenant) {
      const note: TenantNote = {
        id: `note-${Date.now()}`,
        content: newNote,
        timestamp: new Date(),
        type: "manual"
      };
      
      const updatedTenant = {
        ...selectedTenant,
        notes: [note, ...selectedTenant.notes]
      };
      
      setTenants(tenants.map(t => 
        t.id === selectedTenant.id ? updatedTenant : t
      ));
      setSelectedTenant(updatedTenant);
      setNewNote("");
    }
  };

  const updateEditData = (field: string, value: any) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleAddTenant = () => {
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      propertyId: "",
      propertyName: "",
      unitNumber: "",
      rentAmount: 0,
      leaseStart: new Date(),
      leaseEnd: new Date(),
      pets: "",
      notes: []
    };
    setEditData(newTenant);
    setIsEditMode(true);
    setIsAddingTenant(true);
    setSelectedTenant(null);
  };

  const handleSaveNewTenant = () => {
    if (editData && editData.name.trim()) {
      setTenants([...tenants, editData]);
      setSelectedTenant(editData);
      setIsEditMode(false);
      setIsAddingTenant(false);
      setEditData(null);
    }
  };

  const handleCancelAddTenant = () => {
    setIsEditMode(false);
    setIsAddingTenant(false);
    setEditData(null);
  };

  // If we have an ID from the URL and found a tenant, show tenant detail view
  if (id && selectedTenant) {
    return (
      <div className="h-full bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/tenants">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tenants
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{selectedTenant.name}</h1>
                <p className="text-muted-foreground">{selectedTenant.propertyName} - Unit {selectedTenant.unitNumber}</p>
              </div>
            </div>
          </div>
          {!isEditMode && (
            <Button onClick={() => handleEditTenant(selectedTenant)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Tenant
            </Button>
          )}
        </div>

        <div className="p-6 overflow-y-auto">
          {isEditMode && editData ? (
            /* Edit Mode */
            <div className="space-y-6">
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                <Button onClick={handleSaveTenant} disabled={!editData?.name.trim()}>
                  {isAddingTenant ? "Add Tenant" : "Save Changes"}
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>{isAddingTenant ? "Add New Tenant" : "Edit Tenant Information"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <Input
                        value={editData.name}
                        onChange={(e) => updateEditData('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        value={editData.email}
                        onChange={(e) => updateEditData('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => updateEditData('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Unit Number</label>
                      <Input
                        value={editData.unitNumber}
                        onChange={(e) => updateEditData('unitNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Rent Amount</label>
                      <Input
                        type="number"
                        value={editData.rentAmount}
                        onChange={(e) => updateEditData('rentAmount', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Pets</label>
                      <Input
                        value={editData.pets}
                        onChange={(e) => updateEditData('pets', e.target.value)}
                        placeholder="e.g., Cat - Whiskers"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm">{selectedTenant.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedTenant.phone}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Property
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Unit {selectedTenant.unitNumber}</p>
                      <p className="text-sm text-muted-foreground">{selectedTenant.propertyName}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Rent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{formatCurrency(selectedTenant.rentAmount)}</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-primary" />
                      Pets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedTenant.pets || "None"}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Lease Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Lease Start</p>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedTenant.leaseStart)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Lease End</p>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedTenant.leaseEnd)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Notes & History</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewNote("Add your note here...")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Add Note Input */}
                  <div className="mb-4">
                    <Textarea
                      placeholder="Add a note about this tenant..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                        Save Note
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setNewNote("")}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                  
                  {/* Notes List */}
                  <div className="space-y-3">
                    {selectedTenant.notes.map((note) => (
                      <div key={note.id} className="border-l-4 border-primary/20 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={note.type === "auto" ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            {note.type === "auto" ? "Auto" : "Manual"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.timestamp)}
                          </span>
                          {note.source && (
                            <span className="text-xs text-muted-foreground">
                              • from {note.source}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  {selectedTenant.notes.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No notes or history recorded yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise show the tenants list view
  return (
    <div className="h-full flex">
      {/* Tenants List */}
      <div className="w-1/2 border-r border-border bg-gradient-card">
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold">Tenants</h1>
            <Button onClick={() => handleAddTenant()}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Tenant
            </Button>
          </div>
          <p className="text-muted-foreground">Manage tenant profiles and information</p>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto">
          {tenants.map((tenant) => (
            <Card 
              key={tenant.id} 
              className={`cursor-pointer transition-all hover:shadow-medium ${
                selectedTenant?.id === tenant.id ? 'border-primary shadow-soft' : ''
              }`}
              onClick={() => setSelectedTenant(tenant)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tenant.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        {tenant.propertyName} - Unit {tenant.unitNumber}
                      </div>
                    </div>
                  </div>
                  <Link to={`/tenants/${tenant.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    {tenant.email}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(tenant.rentAmount)}/mo
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Tenant Details */}
      <div className="flex-1 bg-background">
        {selectedTenant ? (
          <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="border-b border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedTenant.name}</h2>
                <div className="flex gap-2">
                  <Link to={`/tenants/${selectedTenant.id}`}>
                    <Button variant="outline">
                      View Full Profile
                    </Button>
                  </Link>
                  <Button onClick={() => handleEditTenant(selectedTenant)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                {selectedTenant.propertyName} - Unit {selectedTenant.unitNumber}
              </div>
            </div>
            
            {/* Quick Info Cards */}
            <div className="p-6 grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedTenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedTenant.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Lease Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rent:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedTenant.rentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Lease End:</span>
                      <span className="text-sm">{formatDate(selectedTenant.leaseEnd)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Select a Tenant</h3>
              <p className="text-muted-foreground">Choose a tenant to view their profile and information</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
