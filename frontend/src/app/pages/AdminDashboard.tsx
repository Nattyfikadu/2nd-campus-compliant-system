import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useComplaints } from '@/app/context/ComplaintContext';
import { ComplaintManagementCard } from '@/app/components/ComplaintManagementCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
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
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';

const COLORS = ['#3b82f6', '#eab308', '#8b5cf6', '#22c55e', '#ef4444'];

export function AdminDashboard() {
  const { user, getPendingStaff, approveStaff, rejectStaff } = useAuth();
  const { complaints } = useComplaints();

  if (!user) return null;

  const [pendingStaff, setPendingStaff] = useState<any[]>([]);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const locationLabels: Record<string, string> = {
    cafeteria: 'Cafeteria',
    dormitory: 'Dormitory',
    registrar: 'Registrar Office',
    'hr-office': 'HR Office',
    faculty: 'Faculty Building',
    library: 'Library',
  };

  useEffect(() => {
    const load = async () => {
      const staff = await getPendingStaff();
      setPendingStaff(staff);
    };
    load();
  }, [getPendingStaff]);

  const handleApproveStaff = async (staffId: string) => {
    const ok = await approveStaff(staffId);
    if (!ok) return;
    const staff = await getPendingStaff();
    setPendingStaff(staff);
  };

  const handleOpenReject = (staffId: string) => {
    setRejectTargetId(staffId);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetId) return;
    if (!rejectReason.trim()) return;
    const ok = await rejectStaff(rejectTargetId, rejectReason);
    if (!ok) return;
    const staff = await getPendingStaff();
    setPendingStaff(staff);
    setShowRejectDialog(false);
    setRejectTargetId(null);
    setRejectReason('');
  };

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
        <p className="text-muted-foreground mt-1">System-wide analytics and complaint management</p>
      </div>

      {/* Staff approval */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Staff Approval</CardTitle>
          <CardDescription>Approve staff accounts before they can receive complaint assignments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff requests waiting for approval.</p>
          ) : (
            <div className="space-y-2">
              {pendingStaff.map((s) => (
                <div key={s.id} className="p-3 border rounded-md flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{s.fullName}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Locations:{' '}
                      {(s.staffLocations || []).map((loc: string) => locationLabels[loc] || loc).join(', ')}
                    </p>
                  </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleApproveStaff(s.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleOpenReject(s.id)}
                        >
                          Reject
                        </Button>
                      </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Staff Registration</DialogTitle>
                <DialogDescription>
                  Provide a reason. This will help the staff understand why their registration was rejected.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Textarea
                  value={rejectReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleConfirmReject}
                  disabled={!rejectReason.trim()}
                >
                  Confirm Reject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="size-12 mx-auto mb-3 text-muted-foreground/50" />
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
                  canSupport={complaint.status === 'in-progress'}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}