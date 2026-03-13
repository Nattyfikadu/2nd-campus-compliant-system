import { useState } from 'react';
import { Complaint, useComplaints } from '@/app/context/ComplaintContext';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  AlertTriangle,
  User,
  UserCheck,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface ComplaintManagementCardProps {
  complaint: Complaint;
  canApprove?: boolean;
  canAssign?: boolean;
  canResolve?: boolean;
}

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-blue-100 text-blue-700' },
  'in-progress': { label: 'In Progress', icon: Clock, color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700' },
};

const locationLabels: Record<string, string> = {
  'cafeteria': 'Cafeteria',
  'dormitory': 'Dormitory',
  'registrar': 'Registrar Office',
  'hr-office': 'HR Office',
  'faculty': 'Faculty Building',
  'library': 'Library',
};

const issueTypeLabels: Record<string, string> = {
  'service-problem': 'Service Problem',
  'staff-behavior': 'Staff Behavior',
  'security-issue': 'Security Issue',
  'facility-problem': 'Facility Problem',
  'academic-issue': 'Academic Issue',
};

const API_BASE = 'http://localhost:4000';

export function ComplaintManagementCard({
  complaint,
  canApprove = false,
  canAssign = false,
  canResolve = false
}: ComplaintManagementCardProps) {
  const { updateComplaintStatus } = useComplaints();
  const { getAllStaff } = useAuth();
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [staffMembers, setStaffMembers] = useState<{ id: string, name: string }[]>([]);

  const statusKey = complaint.status as keyof typeof statusConfig;
  const status = statusConfig[statusKey] || statusConfig.pending;
  const StatusIcon = status.icon;

  const handleOpenAssignDialog = async (open: boolean) => {
    setShowAssignDialog(open);
    if (open && getAllStaff) {
      try {
        const staffList = await getAllStaff();
        setStaffMembers(staffList.map(s => ({ id: s.id, name: s.fullName || s.name || 'Unknown Staff' })));
      } catch (err) {
        console.error('Failed to load staff list');
      }
    }
  };

  const handleApprove = () => {
    updateComplaintStatus(complaint.id, 'approved');
    toast.success('Complaint approved', {
      description: 'The complaint has been approved and is ready for assignment.',
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    updateComplaintStatus(complaint.id, 'rejected', undefined, rejectionReason);
    toast.success('Complaint rejected', {
      description: 'The submitter will be notified of the rejection.',
    });
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  const handleAssign = () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }
    const staff = staffMembers.find(s => s.id === selectedStaff);
    if (staff) {
      updateComplaintStatus(complaint.id, 'in-progress', { id: staff.id, name: staff.name });
      toast.success('Complaint assigned', {
        description: `Assigned to ${staff.name}. They will be notified.`,
      });
      setShowAssignDialog(false);
      setSelectedStaff('');
    }
  };

  const handleResolve = () => {
    updateComplaintStatus(complaint.id, 'resolved');
    toast.success('Complaint resolved', {
      description: 'The complaint has been marked as resolved.',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{complaint.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={status.color}>
                <StatusIcon className="size-3 mr-1" />
                {status.label}
              </Badge>
              <Badge variant="secondary">
                <MapPin className="size-3 mr-1" />
                {locationLabels[complaint.location]}
              </Badge>
              <Badge variant="secondary">
                <AlertTriangle className="size-3 mr-1" />
                {issueTypeLabels[complaint.category]}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{complaint.description}</p>

        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Attachments:</p>
            <div className="flex flex-wrap gap-2">
              {complaint.attachments.map((att) =>
                att.type === 'image' ? (
                  <a
                    key={att.url}
                    href={`${API_BASE}${att.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <ImageWithFallback
                      src={`${API_BASE}${att.url}`}
                      alt={att.originalName}
                      className="h-16 w-16 object-cover rounded border"
                    />
                  </a>
                ) : (
                  <a
                    key={att.url}
                    href={`${API_BASE}${att.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    {att.originalName || 'Video attachment'}
                  </a>
                )
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <User className="size-3" />
            <span>Submitted by: {complaint.submittedBy.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>{format(complaint.createdAt, 'MMM d, yyyy')}</span>
          </div>
          {complaint.assignedTo && (
            <div className="flex items-center gap-1">
              <UserCheck className="size-3" />
              <span>Assigned to: {complaint.assignedTo.name}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {canApprove && complaint.status === 'pending' && (
            <>
              <Button onClick={handleApprove} size="sm" className="bg-green-600 hover:bg-green-700">
                <ThumbsUp className="size-3 mr-1" />
                Approve
              </Button>
              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <ThumbsDown className="size-3 mr-1" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Complaint</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this complaint. This will be visible to the submitter.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Rejection Reason</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Explain why this complaint is being rejected..."
                      value={rejectionReason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleReject}>
                      Reject Complaint
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {canAssign && complaint.status === 'approved' && (
            <Dialog open={showAssignDialog} onOpenChange={handleOpenAssignDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <UserCheck className="size-3 mr-1" />
                  Assign Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Complaint to Staff</DialogTitle>
                  <DialogDescription>
                    Select a staff member to handle this complaint. They will be notified immediately.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="staff-select">Staff Member</Label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger id="staff-select">
                      <SelectValue placeholder="Select a staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssign}>
                    Assign Complaint
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canResolve && complaint.status === 'in-progress' && (
            <Button onClick={handleResolve} size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="size-3 mr-1" />
              Mark as Resolved
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
