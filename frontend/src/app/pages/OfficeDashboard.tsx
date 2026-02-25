import { useAuth } from '@/app/context/AuthContext';
import { useComplaints } from '@/app/context/ComplaintContext';
import { ComplaintManagementCard } from '@/app/components/ComplaintManagementCard';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { FileText, Clock, CheckCircle2, XCircle, UserCheck } from 'lucide-react';

export function OfficeDashboard() {
  const { user } = useAuth();
  const { complaints, getComplaintsByStatus } = useComplaints();

  if (!user) return null;

  const pendingComplaints = getComplaintsByStatus('pending');
  const approvedComplaints = getComplaintsByStatus('approved');
  const inProgressComplaints = getComplaintsByStatus('in-progress');
  const resolvedComplaints = getComplaintsByStatus('resolved');
  const rejectedComplaints = getComplaintsByStatus('rejected');

  const stats = [
    { label: 'Pending Review', value: pendingComplaints.length, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Approved', value: approvedComplaints.length, icon: CheckCircle2, color: 'bg-blue-100 text-blue-700' },
    { label: 'In Progress', value: inProgressComplaints.length, icon: UserCheck, color: 'bg-purple-100 text-purple-700' },
    { label: 'Resolved', value: resolvedComplaints.length, icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Office Dashboard</h1>
        <p className="text-gray-500 mt-1">Review, approve, and assign complaints</p>
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

      {/* Complaints Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingComplaints.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedComplaints.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressComplaints.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedComplaints.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedComplaints.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Clock className="size-12 mx-auto mb-3 text-gray-300" />
                <p>No pending complaints to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingComplaints.map((complaint) => (
                <ComplaintManagementCard
                  key={complaint.id}
                  complaint={complaint}
                  canApprove={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <CheckCircle2 className="size-12 mx-auto mb-3 text-gray-300" />
                <p>No approved complaints awaiting assignment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedComplaints.map((complaint) => (
                <ComplaintManagementCard
                  key={complaint.id}
                  complaint={complaint}
                  canAssign={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgressComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <UserCheck className="size-12 mx-auto mb-3 text-gray-300" />
                <p>No complaints currently in progress</p>
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
                <p>No resolved complaints</p>
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

        <TabsContent value="rejected" className="space-y-4">
          {rejectedComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <XCircle className="size-12 mx-auto mb-3 text-gray-300" />
                <p>No rejected complaints</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rejectedComplaints.map((complaint) => (
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