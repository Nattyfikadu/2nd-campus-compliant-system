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
} from '@/app/components/ui/dialog';
import { FileText, Clock, CheckCircle2, XCircle, UserCheck, AlertCircle, Mail, CreditCard, Building2, GraduationCap, Briefcase, MapPin, Phone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';

type FilterKey = 'pending' | 'approved' | 'in-progress' | 'resolved' | 'rejected';

const locationLabels: Record<string, string> = {
  cafeteria: 'Cafeteria',
  dormitory: 'Dormitory',
  registrar: 'Registrar Office',
  'hr-office': 'HR Office',
  faculty: 'Faculty Building',
  library: 'Library',
};

export function OfficeDashboard() {
  const { user, getPendingStaff, approveStaff, rejectStaff } = useAuth();
  const { getComplaintsByStatus } = useComplaints();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('pending');
  const [pendingStaff, setPendingStaff] = useState<any[]>([]);
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  if (!user) return null;

  useEffect(() => {
    getPendingStaff().then(setPendingStaff);
  }, [getPendingStaff]);

  const handleApproveStaff = async (staffId: string) => {
    const ok = await approveStaff(staffId);
    if (ok) getPendingStaff().then(setPendingStaff);
  };

  const handleOpenReject = (staffId: string) => {
    setRejectTargetId(staffId);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetId || !rejectReason.trim()) return;
    const ok = await rejectStaff(rejectTargetId, rejectReason);
    if (!ok) return;
    getPendingStaff().then(setPendingStaff);
    setShowRejectDialog(false);
    setRejectTargetId(null);
    setRejectReason('');
  };

  const pendingComplaints = getComplaintsByStatus('pending');
  const approvedComplaints = getComplaintsByStatus('approved');
  const inProgressComplaints = getComplaintsByStatus('in-progress');
  const resolvedComplaints = getComplaintsByStatus('resolved');
  const rejectedComplaints = getComplaintsByStatus('rejected');

  const stats: {
    key: FilterKey;
    label: string;
    value: number;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    border: string;
    accent: string;
    activeBg: string;
  }[] = [
    {
      key: 'pending',
      label: 'Pending Review',
      value: pendingComplaints.length,
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      border: 'border-amber-200',
      accent: 'from-amber-50 to-white',
      activeBg: 'ring-2 ring-amber-400',
    },
    {
      key: 'approved',
      label: 'Approved',
      value: approvedComplaints.length,
      icon: CheckCircle2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'from-blue-50 to-white',
      activeBg: 'ring-2 ring-blue-400',
    },
    {
      key: 'in-progress',
      label: 'In Progress',
      value: inProgressComplaints.length,
      icon: AlertCircle,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      border: 'border-purple-200',
      accent: 'from-purple-50 to-white',
      activeBg: 'ring-2 ring-purple-400',
    },
    {
      key: 'resolved',
      label: 'Resolved',
      value: resolvedComplaints.length,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-200',
      accent: 'from-emerald-50 to-white',
      activeBg: 'ring-2 ring-emerald-400',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      value: rejectedComplaints.length,
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      border: 'border-red-200',
      accent: 'from-red-50 to-white',
      activeBg: 'ring-2 ring-red-400',
    },
  ];

  const complaintMap: Record<FilterKey, typeof pendingComplaints> = {
    pending: pendingComplaints,
    approved: approvedComplaints,
    'in-progress': inProgressComplaints,
    resolved: resolvedComplaints,
    rejected: rejectedComplaints,
  };

  const filteredComplaints = complaintMap[activeFilter];
  const activeLabel = stats.find(s => s.key === activeFilter)?.label ?? '';

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Office Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Review, approve, and assign complaints</p>
      </div>

      {/* Pending Staff Approvals — collapsible */}
      <div>
        {/* Toggle button — always visible */}
        <button
          onClick={() => setShowStaffPanel(v => !v)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors
            ${pendingStaff.length > 0
              ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
        >
          <div className="flex items-center gap-2.5">
            <UserCheck className={`size-4 ${pendingStaff.length > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-semibold ${pendingStaff.length > 0 ? 'text-amber-800' : 'text-gray-600'}`}>
              Pending Staff Approvals
            </span>
            {pendingStaff.length > 0 && (
              <span className="inline-flex items-center justify-center size-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {pendingStaff.length}
              </span>
            )}
          </div>
          <span className="text-gray-400 text-xs font-medium">
            {showStaffPanel ? '▲ Collapse' : '▼ Show'}
          </span>
        </button>

        {/* Collapsible content */}
        {showStaffPanel && (
          <div className="mt-3 space-y-3">
            {pendingStaff.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 italic">
                No pending staff registrations.
              </p>
            ) : (
              pendingStaff.map((s) => (
                <div key={s.id} className="p-4 bg-white border border-amber-100 rounded-xl shadow-sm space-y-3">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-base">
                          {s.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{s.fullName}</p>
                        <p className="text-xs text-muted-foreground">Staff Registration</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
                      Pending
                    </span>
                  </div>

                  {/* Detail grid */}
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-sm">
                    {[
                      { icon: <Mail className="size-3.5 text-muted-foreground" />, label: 'Email', value: s.email },
                      { icon: <CreditCard className="size-3.5 text-muted-foreground" />, label: 'Staff ID', value: s.staffId },
                      { icon: <Building2 className="size-3.5 text-muted-foreground" />, label: 'Department', value: s.department },
                      { icon: <GraduationCap className="size-3.5 text-muted-foreground" />, label: 'Faculty', value: s.faculty },
                      { icon: <Briefcase className="size-3.5 text-muted-foreground" />, label: 'Position', value: s.position },
                      { icon: <MapPin className="size-3.5 text-muted-foreground" />, label: 'Locations', value: (s.staffLocations || []).map((loc: string) => locationLabels[loc] || loc).join(', ') || undefined },
                      { icon: <Phone className="size-3.5 text-muted-foreground" />, label: 'Phone', value: s.phone },
                    ]
                      .filter((row) => row.value)
                      .map((row) => (
                        <div key={row.label} className="flex items-start gap-2">
                          <span className="mt-0.5 shrink-0">{row.icon}</span>
                          <span className="text-muted-foreground font-medium w-20 shrink-0">{row.label}:</span>
                          <span className="text-gray-900 font-medium break-all">{row.value}</span>
                        </div>
                      ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1" onClick={() => handleApproveStaff(s.id)}>
                      ✓ Approve
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 flex-1" onClick={() => handleOpenReject(s.id)}>
                      ✕ Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Staff Registration</DialogTitle>
            <DialogDescription>
              Provide a reason so the staff member understands why their registration was rejected.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmReject} disabled={!rejectReason.trim()}>
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stat Cards — click to filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeFilter === stat.key;
          return (
            <Card
              key={stat.key}
              onClick={() => setActiveFilter(stat.key)}
              className={`
                group relative overflow-hidden border ${stat.border}
                bg-gradient-to-br ${stat.accent}
                shadow-sm hover:shadow-lg
                transition-all duration-300 ease-in-out
                hover:-translate-y-1 cursor-pointer select-none
                ${isActive ? stat.activeBg : ''}
              `}
            >
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-bold text-gray-900 leading-none">{stat.value}</p>
                  </div>
                  <div className={`size-11 rounded-xl ${stat.iconBg} flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`size-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.iconBg} opacity-60`} />
            </Card>
          );
        })}
      </div>

      {/* Complaint List */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Showing: <span className="font-medium text-gray-700">{activeLabel}</span>
          {' '}({filteredComplaints.length})
        </p>

        {filteredComplaints.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="size-7 text-muted-foreground opacity-60" />
              </div>
              <p className="text-muted-foreground text-sm">No {activeLabel.toLowerCase()} complaints</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map((complaint) => (
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
      </div>
    </div>
  );
}
