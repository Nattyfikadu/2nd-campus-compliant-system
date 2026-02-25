import { useAuth } from '@/app/context/AuthContext';
import { useComplaints } from '@/app/context/ComplaintContext';
import { ComplaintManagementCard } from '@/app/components/ComplaintManagementCard';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { UserCheck, CheckCircle2, Clock } from 'lucide-react';

export function StaffDashboard() {
  const { user } = useAuth();
  const { complaints, getComplaintsByAssignee } = useComplaints();

  if (!user) return null;

  const assignedComplaints = getComplaintsByAssignee(user.id);
  const inProgressComplaints = assignedComplaints.filter(c => c.status === 'in-progress');
  const resolvedComplaints = assignedComplaints.filter(c => c.status === 'resolved');

  const stats = [
    { label: 'Total Assigned', value: assignedComplaints.length, icon: UserCheck, color: 'bg-blue-100 text-blue-700' },
    { label: 'In Progress', value: inProgressComplaints.length, icon: Clock, color: 'bg-purple-100 text-purple-700' },
    { label: 'Resolved', value: resolvedComplaints.length, icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.fullName || user.name}</h1>
        <p className="text-gray-500 mt-1">Manage complaints assigned to you</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Assigned Complaints */}
      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in-progress">In Progress ({inProgressComplaints.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedComplaints.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgressComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Clock className="size-12 mx-auto mb-3 text-gray-300" />
                <p>No complaints currently assigned to you</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressComplaints.map((complaint) => (
                <ComplaintManagementCard
                  key={complaint.id}
                  complaint={complaint}
                  canResolve={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CheckCircle2 className="size-12 mx-auto mb-3 text-gray-300" />
                <p>No resolved complaints yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resolvedComplaints.map((complaint) => (
                <ComplaintManagementCard
                  key={complaint.id}
                  complaint={complaint}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}