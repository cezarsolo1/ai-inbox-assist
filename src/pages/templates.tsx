import { useState } from "react";
import { Plus, Edit, Trash2, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockTemplates, type Template } from "@/lib/mock-data";

const placeholderOptions = [
  "{TenantName}", "{PropertyName}", "{UnitNumber}", "{RentAmount}", 
  "{DueDate}", "{LeaseEndDate}", "{WiFiNetwork}", "{WiFiPassword}", 
  "{TrashSchedule}", "{ResponseDate}", "{NewRentAmount}"
];

const categoryColors = {
  "Payments": "bg-error/10 text-error",
  "Maintenance": "bg-warning/10 text-warning", 
  "Leasing": "bg-primary/10 text-primary",
  "Information": "bg-success/10 text-success"
};

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState(mockTemplates);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "Information"
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category
    });
    setIsEditDialogOpen(true);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      content: "",
      category: "Information"
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...editingTemplate, ...formData }
          : t
      ));
    } else {
      // Add new template
      const newTemplate: Template = {
        id: `template-${Date.now()}`,
        ...formData
      };
      setTemplates([...templates, newTemplate]);
    }
    setIsEditDialogOpen(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = formData.content;
      const newContent = content.substring(0, start) + placeholder + content.substring(end);
      setFormData({ ...formData, content: newContent });
      
      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  return (
    <div className="h-full bg-gradient-card">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Message Templates</h1>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddTemplate} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Add New Template"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template Name</label>
                  <Input
                    placeholder="e.g., Rent Payment Reminder"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Information">Information</option>
                    <option value="Payments">Payments</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Leasing">Leasing</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message Content</label>
                  <Textarea
                    placeholder="Enter your template message..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Available Placeholders</label>
                  <div className="flex flex-wrap gap-2">
                    {placeholderOptions.map((placeholder) => (
                      <Button
                        key={placeholder}
                        variant="outline"
                        size="sm"
                        onClick={() => insertPlaceholder(placeholder)}
                        className="text-xs"
                      >
                        {placeholder}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click any placeholder to insert it at your cursor position
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveTemplate}
                    disabled={!formData.name.trim() || !formData.content.trim()}
                  >
                    {editingTemplate ? "Update" : "Create"} Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Templates Grid */}
      <div className="p-6 overflow-y-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-medium transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{template.name}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={categoryColors[template.category as keyof typeof categoryColors]}
                    >
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search" : "Create your first template to get started"}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddTemplate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}