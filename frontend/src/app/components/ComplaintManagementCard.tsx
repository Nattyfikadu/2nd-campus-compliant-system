import { useState } from 'react';
import { Attachment, Complaint, useComplaints } from '@/app/context/ComplaintContext';
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
  canSupport?: boolean;
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

import { API_BASE } from '@/lib/api';

function resolveUrl(url: string) {
  if (!url) return url;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export function ComplaintManagementCard({
  complaint,
  canApprove = false,
  canAssign = false,
  canResolve = false,
  canSupport = false
}: ComplaintManagementCardProps) {
  const { updateComplaintStatus, reloadComplaints } = useComplaints();
  const { getAllStaff, user } = useAuth();
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolutionDescription, setResolutionDescription] = useState('');
  const [resolutionAttachments, setResolutionAttachments] = useState<File[]>([]);
  const [showCannotResolveDialog, setShowCannotResolveDialog] = useState(false);
  const [cannotResolveReason, setCannotResolveReason] = useState('');
  const [cannotResolveType, setCannotResolveType] = useState<'unavailable' | 'beyond-skill'>('unavailable');
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [selectedSupportStaff, setSelectedSupportStaff] = useState('');
  const [staffMembers, setStaffMembers] = useState<
    { id: string; name: string; staffLocations?: string[] }[]
  >([]);

  const statusKey = complaint.status as keyof typeof statusConfig;
  const status = statusConfig[statusKey] || statusConfig.pending;
  const StatusIcon = status.icon;

  const handleOpenAssignDialog = async (open: boolean) => {
    setShowAssignDialog(open);
    if (open && getAllStaff) {
      try {
        const locationFilter =
          complaint.location && complaint.location !== 'unknown' ? complaint.location : undefined;
        const staffList = await getAllStaff(locationFilter);
        setStaffMembers(
          staffList.map((s) => ({
            id: s.id,
            name: (s.fullName || (s as any).name || 'Unknown Staff') as string,
            staffLocations: s.staffLocations || [],
          }))
        );
      } catch (err) {
        console.error('Failed to load staff list');
      }
    }
  };

  const formatStaffLocations = (staffLocations?: string[]) => {
    const locs = (staffLocations || [])
      .filter(Boolean)
      .map((loc) => locationLabels[loc] || loc);
    if (locs.length === 0) return '';
    return `[${locs.join(', ')}] `;
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

  const handleAddSupportStaff = () => {
    if (!selectedSupportStaff) {
      toast.error('Please select a support staff member');
      return;
    }
    const staff = staffMembers.find((s) => s.id === selectedSupportStaff);
    if (!staff) return;
    updateComplaintStatus(
      complaint.id,
      complaint.status,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { id: staff.id, name: staff.name }
    );
    toast.success('Support staff added', {
      description: `${staff.name} was added to support this complaint.`,
    });
    setShowSupportDialog(false);
    setSelectedSupportStaff('');
  };

  const handleCannotResolve = async () => {
    if (!cannotResolveReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    if (!user) return;
    await updateComplaintStatus(
      complaint.id,
      'in-progress',
      undefined,
      undefined,
      undefined,
      undefined,
      cannotResolveType,
      cannotResolveReason.trim(),
      { id: user.id, name: user.fullName || user.name || 'Staff' }
    );
    toast.success("Marked as 'Can't Resolve'", {
      description: 'Admin/office can now reassign or add support staff.',
    });
    setShowCannotResolveDialog(false);
    setCannotResolveReason('');
    setCannotResolveType('unavailable');
    await reloadComplaints();
  };

  const handleResolve = () => {
    setShowResolveDialog(true);
  };

  const handleConfirmResolve = async () => {
    if (!resolutionDescription.trim() && resolutionAttachments.length === 0) {
      toast.error('Please provide a resolution description or upload at least one file');
      return;
    }

    // Upload attachments if any
    let uploadedAttachments: Attachment[] = [];
    if (resolutionAttachments.length > 0) {
      const formData = new FormData();
      resolutionAttachments.forEach(file => {
        formData.append('files', file);
      });

      try {
        const uploadRes = await fetch(`${API_BASE}/api/uploads/resolution`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          toast.error('Failed to upload resolution attachments');
          return;
        }

        const uploadData = await uploadRes.json();
        uploadedAttachments = uploadData.attachments;
      } catch (err) {
        console.error('Upload error:', err);
        toast.error('Failed to upload resolution attachments');
        return;
      }
    }

    updateComplaintStatus(complaint.id, 'resolved', undefined, undefined, resolutionDescription, uploadedAttachments);
    toast.success('Complaint resolved', {
      description: 'The complaint has been marked as resolved.',
    });
    setShowResolveDialog(false);
    setResolutionDescription('');
    setResolutionAttachments([]);
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
                  <a key={att.url} href={resolveUrl(att.url)} target="_blank" rel="noreferrer" className="block">
                    <ImageWithFallback src={resolveUrl(att.url)} alt={att.originalName} className="h-16 w-16 object-cover rounded border" />
                  </a>
                ) : att.type === 'audio' ? (
                  <div key={att.url} className="w-full">
                    <p className="text-xs text-muted-foreground mb-1">{att.originalName}</p>
                    <audio controls src={resolveUrl(att.url)} className="w-full h-8" />
                  </div>
                ) : (
                  <a key={att.url} href={resolveUrl(att.url)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                    {att.originalName || 'Attachment'}
                  </a>
                )
              )}
            </div>
          </div>
        )}

        {complaint.status === 'resolved' && complaint.resolutionDescription && (
          <div className="space-y-1 pt-2 border-t">
            <p className="text-xs font-semibold text-gray-500">Resolution:</p>
            <p className="text-sm text-muted-foreground">{complaint.resolutionDescription}</p>
          </div>
        )}

        {complaint.escalationReason && (user?.role === 'admin' || user?.role === 'office') && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs font-semibold text-yellow-800 mb-1">Staff Escalation:</p>
            <p className="text-xs text-yellow-700">
              Type: {complaint.escalationType === 'beyond-skill' ? 'Beyond ability' : 'Unavailable'}
            </p>
            <p className="text-xs text-yellow-700">Reason: {complaint.escalationReason}</p>
            {complaint.escalationReportedBy?.name && (
              <p className="text-xs text-yellow-700">Reported by: {complaint.escalationReportedBy.name}</p>
            )}
          </div>
        )}

        {complaint.supportStaff && complaint.supportStaff.length > 0 && (
          <div className="space-y-1 pt-2 border-t">
            <p className="text-xs font-semibold text-gray-500">Support Staff:</p>
            <div className="flex flex-wrap gap-2">
              {complaint.supportStaff.map((s) => (
                <Badge key={s.id} variant="secondary">
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {complaint.status === 'resolved' && complaint.resolutionAttachments && complaint.resolutionAttachments.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Resolution Attachments:</p>
            <div className="flex flex-wrap gap-2">
              {complaint.resolutionAttachments.map((att) =>
                att.type === 'image' ? (
                  <a key={att.url} href={resolveUrl(att.url)} target="_blank" rel="noreferrer" className="block">
                    <ImageWithFallback src={resolveUrl(att.url)} alt={att.originalName} className="h-16 w-16 object-cover rounded border" />
                  </a>
                ) : att.type === 'audio' ? (
                  <div key={att.url} className="w-full">
                    <p className="text-xs text-muted-foreground mb-1">{att.originalName}</p>
                    <audio controls src={resolveUrl(att.url)} className="w-full h-8" />
                  </div>
                ) : (
                  <a key={att.url} href={resolveUrl(att.url)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                    {att.originalName}
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
                          {formatStaffLocations(staff.staffLocations)}
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

          {canSupport && complaint.status === 'in-progress' && (
            <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <UserCheck className="size-3 mr-1" />
                  Add Support Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Support Staff</DialogTitle>
                  <DialogDescription>
                    Add an additional staff member to support the primary assignee.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="support-staff-select">Support Staff</Label>
                  <Select
                    value={selectedSupportStaff}
                    onValueChange={setSelectedSupportStaff}
                    onOpenChange={(open) => handleOpenAssignDialog(open)}
                  >
                    <SelectTrigger id="support-staff-select">
                      <SelectValue placeholder="Select support staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers
                        .filter((s) => s.id !== complaint.assignedTo?.id)
                        .filter((s) => !(complaint.supportStaff || []).some((x) => x.id === s.id))
                        .map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {formatStaffLocations(staff.staffLocations)}
                            {staff.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSupportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSupportStaff}>Add Support</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canResolve && complaint.status === 'in-progress' && (
            <>
              <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
                <DialogTrigger asChild>
                  <Button onClick={handleResolve} size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="size-3 mr-1" />
                    Mark as Resolved
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Resolve Complaint</DialogTitle>
                    <DialogDescription>
                      Please provide details about how this complaint was resolved. You must either write a description or upload at least one file (image or document).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resolution-description">Resolution Description</Label>
                      <Textarea
                        id="resolution-description"
                        placeholder="Describe how the issue was resolved..."
                        value={resolutionDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolutionDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resolution-attachments">Upload Files (Optional)</Label>
                      <input
                        id="resolution-attachments"
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const files = Array.from(e.target.files || []);
                          setResolutionAttachments(files);
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {resolutionAttachments.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {resolutionAttachments.length} file(s) selected
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmResolve}>
                      Mark as Resolved
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {user?.role === 'staff' && (
                <Dialog open={showCannotResolveDialog} onOpenChange={setShowCannotResolveDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-50">
                      I Can't Resolve This
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Escalate Complaint</DialogTitle>
                      <DialogDescription>
                        Explain why you cannot resolve this complaint so admin/office can reassign or add support.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Reason Type</Label>
                        <Select
                          value={cannotResolveType}
                          onValueChange={(v) => setCannotResolveType(v as 'unavailable' | 'beyond-skill')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unavailable">Unavailable (off-campus / not available)</SelectItem>
                            <SelectItem value="beyond-skill">Issue is beyond my ability</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Details</Label>
                        <Textarea
                          value={cannotResolveReason}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCannotResolveReason(e.target.value)}
                          placeholder="Explain why you cannot resolve this complaint..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCannotResolveDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCannotResolve} disabled={!cannotResolveReason.trim()}>
                        Submit Escalation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
