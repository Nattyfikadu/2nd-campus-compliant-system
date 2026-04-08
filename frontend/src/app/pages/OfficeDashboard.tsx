import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useComplaints } from '@/app/context/ComplaintContext';
import { ComplaintManagementCard } from '@/app/components/ComplaintManagementCard';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { FileText, Clock, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';

export function OfficeDashboard() {
  const { user, getPendingStaff, approveStaff, rejectStaff } = useAuth();
  const { complaints, getComplaintsByStatus } = useComplaints();

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
        <p className="text-muted-foreground mt-1">Review, approve, and assign complaints</p>
      </div>

      {/* Staff approval */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Pending Staff Approval</p>
              <p className="text-2xl font-bold">{pendingStaff.length}</p>
            </div>
            <UserCheck className="size-6 text-blue-600" />
          </div>

          {pendingStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No staff requests waiting for approval.</p>
          ) : (
            <div className="space-y-3">
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="size-12 mx-auto mb-3 text-muted-foreground/50" />
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="size-12 mx-auto mb-3 text-muted-foreground/50" />
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <UserCheck className="size-12 mx-auto mb-3 text-muted-foreground/50" />
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
                  canSupport={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedComplaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="size-12 mx-auto mb-3 text-muted-foreground/50" />
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
              <CardContent className="py-12 text-center text-muted-foreground">
                <XCircle className="size-12 mx-auto mb-3 text-muted-foreground/50" />
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