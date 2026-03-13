import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useComplaints } from '@/app/context/ComplaintContext';
import { ComplaintForm } from '@/app/components/ComplaintForm';
import { ComplaintCard } from '@/app/components/ComplaintCard';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { PlusCircle, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { complaints, getComplaintsByUser } = useComplaints();
  const [showForm, setShowForm] = useState(false);

  if (!user) return null;

  const userComplaints = getComplaintsByUser(user.id);
  const pendingCount = userComplaints.filter(c => c.status === 'pending').length;
  const approvedCount = userComplaints.filter(c => c.status === 'approved').length;
  const inProgressCount = userComplaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = userComplaints.filter(c => c.status === 'resolved').length;
  const rejectedCount = userComplaints.filter(c => c.status === 'rejected').length;

  const stats = [
    { label: 'Total Complaints', value: userComplaints.length, icon: FileText, color: 'bg-blue-100 text-blue-700' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'In Progress', value: inProgressCount, icon: AlertCircle, color: 'bg-purple-100 text-purple-700' },
    { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.fullName || user.name}</h1>
          <p className="text-muted-foreground mt-1">Manage and track your campus complaints</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <PlusCircle className="size-4 mr-2" />
          {showForm ? 'View Complaints' : 'New Complaint'}
        </Button>
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

      {/* Main Content */}
      {showForm ? (
        <ComplaintForm onSuccess={() => setShowForm(false)} />
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({userComplaints.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressCount})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {userComplaints.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="size-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="font-semibold text-lg mb-1">No complaints yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Click "New Complaint" to submit your first issue</p>
                  <Button onClick={() => setShowForm(true)}>
                    <PlusCircle className="size-4 mr-2" />
                    Submit Your First Complaint
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userComplaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userComplaints
                .filter(c => c.status === 'pending')
                .map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
            </div>
            {pendingCount === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No pending complaints
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userComplaints
                .filter(c => c.status === 'in-progress')
                .map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
            </div>
            {inProgressCount === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No complaints in progress
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userComplaints
                .filter(c => c.status === 'resolved')
                .map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
            </div>
            {resolvedCount === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No resolved complaints
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userComplaints
                .filter(c => c.status === 'rejected')
                .map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))}
            </div>
            {rejectedCount === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No rejected complaints
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}