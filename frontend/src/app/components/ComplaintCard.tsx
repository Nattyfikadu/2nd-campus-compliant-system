import { Complaint } from '@/app/context/ComplaintContext';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Loader2,
  Calendar,
  MapPin,
  AlertTriangle,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface ComplaintCardProps {
  complaint: Complaint;
}

const statusConfig = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Loader2,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
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

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  const status = statusConfig[complaint.status];
  const StatusIcon = status.icon;

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
              <Badge variant="secondary" className="bg-gray-100">
                <MapPin className="size-3 mr-1" />
                {locationLabels[complaint.location]}
              </Badge>
              <Badge variant="secondary" className="bg-gray-100">
                <AlertTriangle className="size-3 mr-1" />
                {issueTypeLabels[complaint.category]}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
        
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>Submitted: {format(complaint.createdAt, 'MMM d, yyyy')}</span>
          </div>
          {complaint.assignedTo && (
            <div className="flex items-center gap-1">
              <User className="size-3" />
              <span>Assigned to: {complaint.assignedTo.name}</span>
            </div>
          )}
          {complaint.resolvedAt && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="size-3" />
              <span>Resolved: {format(complaint.resolvedAt, 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {complaint.status === 'rejected' && complaint.rejectionReason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
            <p className="text-xs text-red-600">{complaint.rejectionReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
