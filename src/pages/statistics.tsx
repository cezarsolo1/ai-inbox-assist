import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Clock, AlertTriangle, Euro, Wrench, CheckCircle, Users, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";

// Fake Data
const kpiData = {
  openWorkOrders: { total: 124, urgent: 10, high: 35, medium: 60, low: 19 },
  avgResolutionTime: 3.4,
  ticketsOverdue: 22,
  monthlySpend: 18200
};

const ticketsByCategory = [
  { category: "Plumbing", count: 45, color: "#3b82f6" },
  { category: "Electrical", count: 32, color: "#10b981" },
  { category: "HVAC", count: 28, color: "#f59e0b" },
  { category: "Cleaning", count: 19, color: "#8b5cf6" },
  { category: "Security", count: 15, color: "#ef4444" },
  { category: "Landscaping", count: 12, color: "#06b6d4" }
];

const ticketsByStatus = [
  { name: "Pending", value: 35, color: "#f59e0b" },
  { name: "In Progress", value: 42, color: "#3b82f6" },
  { name: "Scheduled", value: 28, color: "#10b981" },
  { name: "Completed", value: 89, color: "#6b7280" }
];

const monthlyTrends = [
  { month: "Aug", open: 45, closed: 38 },
  { month: "Sep", open: 52, closed: 44 },
  { month: "Oct", open: 48, closed: 41 },
  { month: "Nov", open: 39, closed: 47 },
  { month: "Dec", open: 44, closed: 39 },
  { month: "Jan", open: 41, closed: 43 }
];

const propertyHealth = [
  {
    property: "Greenfield Towers",
    location: "Amsterdam Noord",
    openTickets: 12,
    overdue: 3,
    avgResolution: 2.1,
    monthlySpend: 4500
  },
  {
    property: "Riverpark Apartments", 
    location: "Rotterdam Centrum",
    openTickets: 9,
    overdue: 1,
    avgResolution: 3.4,
    monthlySpend: 2300
  },
  {
    property: "Oceanview Villas",
    location: "Utrecht West",
    openTickets: 18,
    overdue: 6,
    avgResolution: 4.8,
    monthlySpend: 6700
  },
  {
    property: "City Heights",
    location: "Amsterdam Zuid",
    openTickets: 15,
    overdue: 2,
    avgResolution: 2.9,
    monthlySpend: 3800
  },
  {
    property: "Harbor View Complex",
    location: "Rotterdam Haven",
    openTickets: 7,
    overdue: 0,
    avgResolution: 1.8,
    monthlySpend: 1900
  }
];

const vendors = [
  {
    name: "Amsterdam Plumbing Pro",
    avgResponseTime: "2.3 hours",
    completedTickets: 28,
    rating: 4.8,
    specialty: "Plumbing"
  },
  {
    name: "ElectroTech Solutions",
    avgResponseTime: "1.8 hours", 
    completedTickets: 22,
    rating: 4.9,
    specialty: "Electrical"
  },
  {
    name: "HVAC Masters NL",
    avgResponseTime: "3.1 hours",
    completedTickets: 19,
    rating: 4.6,
    specialty: "HVAC"
  },
  {
    name: "CleanCorp Services",
    avgResponseTime: "4.2 hours",
    completedTickets: 31,
    rating: 4.5,
    specialty: "Cleaning"
  }
];

const upcomingMaintenance = [
  { task: "Elevator Inspection - Greenfield Towers", date: "Jan 28", priority: "high" },
  { task: "Boiler Service - Riverpark Apartments", date: "Feb 2", priority: "medium" },
  { task: "Fire Alarm Test - All Properties", date: "Feb 5", priority: "high" },
  { task: "Pool Maintenance - Oceanview Villas", date: "Feb 8", priority: "low" },
  { task: "Generator Check - City Heights", date: "Feb 12", priority: "medium" }
];

const tenantComplaints = [
  { category: "Noise Issues", count: 23, color: "#ef4444" },
  { category: "Temperature Control", count: 19, color: "#f59e0b" },
  { category: "Water Pressure", count: 15, color: "#3b82f6" },
  { category: "Lighting", count: 12, color: "#10b981" },
  { category: "Parking", count: 8, color: "#8b5cf6" }
];

const StatisticsPage = () => {
  const [dateRange, setDateRange] = useState("30");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Maintenance Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights into property maintenance operations</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Open Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.openWorkOrders.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="destructive" className="text-xs">{kpiData.openWorkOrders.urgent} Urgent</Badge>
              <Badge variant="secondary" className="text-xs">{kpiData.openWorkOrders.high} High</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgResolutionTime} days</div>
            <p className="text-xs text-muted-foreground mt-1">↓ 0.3 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Tickets Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{kpiData.ticketsOverdue}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Monthly Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{kpiData.monthlySpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">↑ 8% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart - Tickets by Category */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tickets by Category</CardTitle>
            <CardDescription>Current workload distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Tickets by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ticketsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart - Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Open vs Closed Trends</CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="open" stroke="#ef4444" name="Open" />
                <Line type="monotone" dataKey="closed" stroke="#10b981" name="Closed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Property Health & Vendor Performance Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Property Health Table */}
        <Card>
          <CardHeader>
            <CardTitle>Property Health Snapshot</CardTitle>
            <CardDescription>Performance overview by property</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Overdue</TableHead>
                  <TableHead>Avg Resolution</TableHead>
                  <TableHead>Monthly Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertyHealth.map((property) => (
                  <TableRow key={property.property}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{property.property}</div>
                        <div className="text-xs text-muted-foreground">{property.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>{property.openTickets}</TableCell>
                    <TableCell>
                      {property.overdue > 0 ? (
                        <Badge variant="destructive" className="text-xs">{property.overdue}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">0</Badge>
                      )}
                    </TableCell>
                    <TableCell>{property.avgResolution} days</TableCell>
                    <TableCell>€{property.monthlySpend.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Vendor Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Performance</CardTitle>
            <CardDescription>Top performing service providers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendors.map((vendor, index) => (
              <div key={vendor.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{vendor.name}</div>
                  <div className="text-sm text-muted-foreground">{vendor.specialty}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Response: {vendor.avgResponseTime}</span>
                    <span>Completed: {vendor.completedTickets}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium">{vendor.rating}</span>
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">#{index + 1}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Preventive Maintenance Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
            <CardDescription>Scheduled preventive maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMaintenance.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{task.task}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {task.date}
                  </div>
                </div>
                <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tenant Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Impact</CardTitle>
            <CardDescription>Common complaints and response metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Avg Response Time to Tenants</span>
                <span className="text-2xl font-bold text-primary">4h 12m</span>
              </div>
              <div className="text-sm text-muted-foreground">↓ 23 minutes from last month</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Top Complaints by Category</h4>
              {tenantComplaints.map((complaint) => (
                <div key={complaint.category} className="flex items-center justify-between">
                  <span className="text-sm">{complaint.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${(complaint.count / 25) * 100}%`,
                          backgroundColor: complaint.color 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{complaint.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;