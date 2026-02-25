import { useAuth } from '@/app/context/AuthContext';
import { useComplaints } from '@/app/context/ComplaintContext';
import { ComplaintManagementCard } from '@/app/components/ComplaintManagementCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { FileText, Clock, CheckCircle2, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';

const COLORS = ['#3b82f6', '#eab308', '#8b5cf6', '#22c55e', '#ef4444'];

export function AdminDashboard() {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  if (!user) return null;

  // Calculate statistics
  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const approvedCount = complaints.filter(c => c.status === 'approved').length;
  const inProgressCount = complaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const rejectedCount = complaints.filter(c => c.status === 'rejected').length;

  // Status breakdown for pie chart
  const statusData = [
    { name: 'Pending', value: pendingCount },
    { name: 'Approved', value: approvedCount },
    { name: 'In Progress', value: inProgressCount },
    { name: 'Resolved', value: resolvedCount },
    { name: 'Rejected', value: rejectedCount },
  ].filter(item => item.value > 0);

  // Complaints by location
  const locationData = [
    { name: 'Cafeteria', value: complaints.filter(c => c.location === 'cafeteria').length },
    { name: 'Dormitory', value: complaints.filter(c => c.location === 'dormitory').length },
    { name: 'Registrar', value: complaints.filter(c => c.location === 'registrar').length },
    { name: 'HR Office', value: complaints.filter(c => c.location === 'hr-office').length },
    { name: 'Faculty', value: complaints.filter(c => c.location === 'faculty').length },
    { name: 'Library', value: complaints.filter(c => c.location === 'library').length },
  ].filter(item => item.value > 0);

  // Complaints by issue type
  const issueTypeData = [
    { name: 'Service Problem', value: complaints.filter(c => c.category === 'service-problem').length },
    { name: 'Staff Behavior', value: complaints.filter(c => c.category === 'staff-behavior').length },
    { name: 'Security Issue', value: complaints.filter(c => c.category === 'security-issue').length },
    { name: 'Facility Problem', value: complaints.filter(c => c.category === 'facility-problem').length },
    { name: 'Academic Issue', value: complaints.filter(c => c.category === 'academic-issue').length },
  ].filter(item => item.value > 0);

  const resolutionRate = totalComplaints > 0 ? ((resolvedCount / totalComplaints) * 100).toFixed(1) : 0;

  const stats = [
    { label: 'Total Complaints', value: totalComplaints, icon: FileText, color: 'bg-blue-100 text-blue-700' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: TrendingUp, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System-wide analytics and complaint management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`size-12 rounded-full ${stat.color} flex items-center justify-center`}>
                    <Icon className="size-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="all-complaints">All Complaints ({totalComplaints})</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Breakdown of complaints by current status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Complaints by Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-5" />
                  Complaints by Location
                </CardTitle>
                <CardDescription>Distribution across campus locations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Complaints by Issue Type */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5" />
                  Complaints by Issue Type
                </CardTitle>
                <CardDescription>Categorization of complaint types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={issueTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8b5cf6" name="Number of Complaints" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all-complaints" className="space-y-4">
          {complaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <FileText className="size-12 mx-auto mb-3 text-gray-300" />
                <p>No complaints in the system</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((complaint) => (
                <ComplaintManagementCard
                  key={complaint.id}
                  complaint={complaint}
                  canApprove={complaint.status === 'pending'}
                  canAssign={complaint.status === 'approved'}
                  canResolve={complaint.status === 'in-progress'}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}