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
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

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

const API_BASE = 'http://localhost:4000';

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  const statusKey = complaint.status as keyof typeof statusConfig;
  const status = statusConfig[statusKey] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out border border-gray-100">
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
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>

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

        {complaint.status === 'resolved' &&
          (Boolean(complaint.resolutionDescription) ||
            (complaint.resolutionAttachments && complaint.resolutionAttachments.length > 0)) && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md space-y-2">
              <p className="text-xs font-semibold text-green-700">How this complaint was fixed:</p>

              {complaint.resolutionDescription && (
                <p className="text-xs text-green-700 whitespace-pre-wrap">{complaint.resolutionDescription}</p>
              )}

              {complaint.resolutionAttachments && complaint.resolutionAttachments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-green-700">Resolution Files:</p>
                  <div className="flex flex-wrap gap-2">
                    {complaint.resolutionAttachments.map((att) =>
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
                          className="text-xs text-blue-700 underline"
                        >
                          {att.originalName || 'Resolution file'}
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
