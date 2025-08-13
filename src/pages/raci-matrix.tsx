import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RACIRole {
  id: string;
  name: string;
  department: string;
}

interface RACITask {
  id: string;
  name: string;
  description: string;
  category: string;
  assignments: {
    [roleId: string]: "R" | "A" | "C" | "I" | null;
  };
}

const defaultRoles: RACIRole[] = [
  { id: "1", name: "Property Manager", department: "Operations" },
  { id: "2", name: "Maintenance Lead", department: "Maintenance" },
  { id: "3", name: "Leasing Agent", department: "Leasing" },
  { id: "4", name: "Tenant Relations", department: "Customer Service" },
];

const defaultTasks: RACITask[] = [
  {
    id: "1",
    name: "Tenant Move-In Process",
    description: "Complete process for new tenant onboarding",
    category: "Leasing",
    assignments: {
      "1": "A",
      "2": "I",
      "3": "R",
      "4": "C",
    },
  },
  {
    id: "2",
    name: "Emergency Maintenance Request",
    description: "Handle urgent maintenance issues",
    category: "Maintenance",
    assignments: {
      "1": "A",
      "2": "R",
      "3": "I",
      "4": "C",
    },
  },
];

const raciTypes = [
  { value: "R", label: "Responsible", description: "Does the work", color: "bg-green-100 text-green-800" },
  { value: "A", label: "Accountable", description: "Ultimately answerable", color: "bg-blue-100 text-blue-800" },
  { value: "C", label: "Consulted", description: "Provides input", color: "bg-yellow-100 text-yellow-800" },
  { value: "I", label: "Informed", description: "Kept updated", color: "bg-gray-100 text-gray-800" },
];

const categories = ["Leasing", "Maintenance", "Operations", "Finance", "Legal", "Customer Service"];

export default function RACIMatrixPage() {
  const [roles, setRoles] = useState<RACIRole[]>(defaultRoles);
  const [tasks, setTasks] = useState<RACITask[]>(defaultTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RACITask | null>(null);
  const [editingRole, setEditingRole] = useState<RACIRole | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [roleFormData, setRoleFormData] = useState({
    name: "",
    department: "",
  });
  const { toast } = useToast();

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskFormData({ name: "", description: "", category: "" });
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: RACITask) => {
    setEditingTask(task);
    setTaskFormData({
      name: task.name,
      description: task.description,
      category: task.category,
    });
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!taskFormData.name.trim() || !taskFormData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingTask) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskFormData }
          : task
      ));
      toast({
        title: "Success",
        description: "Task updated successfully.",
      });
    } else {
      const newTask: RACITask = {
        id: Date.now().toString(),
        ...taskFormData,
        assignments: {},
      };
      setTasks([...tasks, newTask]);
      toast({
        title: "Success",
        description: "Task added successfully.",
      });
    }

    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Success",
      description: "Task deleted successfully.",
    });
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleFormData({ name: "", department: "" });
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleFormData.name.trim() || !roleFormData.department.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingRole) {
      setRoles(roles.map(role =>
        role.id === editingRole.id
          ? { ...role, ...roleFormData }
          : role
      ));
    } else {
      const newRole: RACIRole = {
        id: Date.now().toString(),
        ...roleFormData,
      };
      setRoles([...roles, newRole]);
    }

    setIsRoleDialogOpen(false);
    setEditingRole(null);
    toast({
      title: "Success",
      description: editingRole ? "Role updated successfully." : "Role added successfully.",
    });
  };

  const updateAssignment = (taskId: string, roleId: string, value: "R" | "A" | "C" | "I" | null) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            assignments: {
              ...task.assignments,
              [roleId]: value,
            },
          }
        : task
    ));
  };

  const getRACIBadge = (type: string | null) => {
    if (!type) return null;
    const raciType = raciTypes.find(r => r.value === type);
    if (!raciType) return null;

    return (
      <Badge className={raciType.color} variant="secondary">
        {type}
      </Badge>
    );
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">RACI Matrix</h1>
            <p className="text-muted-foreground">Manage responsibility assignments for tasks and processes</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handleAddRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
                  <DialogDescription>
                    {editingRole ? "Update the role details below." : "Create a new role for the RACI matrix."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role-name">Role Name *</Label>
                    <Input
                      id="role-name"
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-department">Department *</Label>
                    <Input
                      id="role-department"
                      value={roleFormData.department}
                      onChange={(e) => setRoleFormData({ ...roleFormData, department: e.target.value })}
                      placeholder="Enter department"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveRole}>
                      {editingRole ? "Update" : "Add"} Role
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
                  <DialogDescription>
                    {editingTask ? "Update the task details below." : "Create a new task for the RACI matrix."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-name">Task Name *</Label>
                    <Input
                      id="task-name"
                      value={taskFormData.name}
                      onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
                      placeholder="Enter task name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={taskFormData.description}
                      onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                      placeholder="Enter task description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-category">Category *</Label>
                    <Select
                      value={taskFormData.category}
                      onValueChange={(value) => setTaskFormData({ ...taskFormData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTask}>
                      {editingTask ? "Update" : "Add"} Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>RACI Legend</CardTitle>
              <CardDescription>Understanding the responsibility types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {raciTypes.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <Badge className={type.color} variant="secondary">
                      {type.value}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Responsibility Matrix</CardTitle>
            <CardDescription>Task assignments across roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Task</TableHead>
                    {roles.map((role) => (
                      <TableHead key={role.id} className="text-center min-w-[120px]">
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-xs text-muted-foreground">{role.department}</div>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                          <Badge variant="outline" className="mt-1">{task.category}</Badge>
                        </div>
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell key={role.id} className="text-center">
                          <Select
                            value={task.assignments[role.id] || ""}
                            onValueChange={(value) => 
                              updateAssignment(task.id, role.id, value === "" ? null : value as "R" | "A" | "C" | "I")
                            }
                          >
                            <SelectTrigger className="w-[80px] mx-auto">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {raciTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.value} - {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}