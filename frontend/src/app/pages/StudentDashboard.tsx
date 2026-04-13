import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useComplaints } from '@/app/context/ComplaintContext';
import { ComplaintForm } from '@/app/components/ComplaintForm';
import { ComplaintCard } from '@/app/components/ComplaintCard';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

type FilterKey = 'all' | 'pending' | 'in-progress' | 'resolved' | 'rejected';

export function StudentDashboard() {
  const { user } = useAuth();
  const { getComplaintsByUser } = useComplaints();
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  if (!user) return null;

  const userComplaints = getComplaintsByUser(user.id);
  const pendingCount = userComplaints.filter(c => c.status === 'pending').length;
  const inProgressCount = userComplaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = userComplaints.filter(c => c.status === 'resolved').length;
  const rejectedCount = userComplaints.filter(c => c.status === 'rejected').length;

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
    trend?: string;
  }[] = [
    {
      key: 'all',
      label: 'Total Submitted',
      value: userComplaints.length,
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'from-blue-50 to-white',
      activeBg: 'ring-2 ring-blue-400',
    },
    {
      key: 'pending',
      label: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      border: 'border-amber-200',
      accent: 'from-amber-50 to-white',
      activeBg: 'ring-2 ring-amber-400',
    },
    {
      key: 'in-progress',
      label: 'In Progress',
      value: inProgressCount,
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
      value: resolvedCount,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-200',
      accent: 'from-emerald-50 to-white',
      activeBg: 'ring-2 ring-emerald-400',
      trend: resolvedCount > 0 && userComplaints.length > 0
        ? `${Math.round((resolvedCount / userComplaints.length) * 100)}% resolution rate`
        : undefined,
    },
    {
      key: 'rejected',
      label: 'Rejected',
      value: rejectedCount,
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      border: 'border-red-200',
      accent: 'from-red-50 to-white',
      activeBg: 'ring-2 ring-red-400',
    },
  ];

  const filteredComplaints = activeFilter === 'all'
    ? userComplaints
    : userComplaints.filter(c => c.status === activeFilter);

  const activeLabel = stats.find(s => s.key === activeFilter)?.label ?? 'All';

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.fullName || user.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's an overview of your submitted complaints
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="lg"
          className="gap-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <PlusCircle className="size-4" />
          {showForm ? 'View My Complaints' : 'New Complaint'}
        </Button>
      </div>

      {/* Stat Cards — click to filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = activeFilter === stat.key;
          return (
            <Card
              key={stat.key}
              onClick={() => { setShowForm(false); setActiveFilter(stat.key); }}
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
                    <p className="text-4xl font-bold text-gray-900 leading-none">
                      {stat.value}
                    </p>
                    {stat.trend && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1 pt-1">
                        <TrendingUp className="size-3" />
                        {stat.trend}
                      </p>
                    )}
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

      {/* Main Content */}
      {showForm ? (
        <ComplaintForm onSuccess={() => setShowForm(false)} />
      ) : (
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
                <h3 className="font-semibold text-lg mb-1">No complaints found</h3>
                <p className="text-muted-foreground text-sm mb-5">
                  {activeFilter === 'all'
                    ? 'Submit your first complaint to get started'
                    : `No complaints with status "${activeLabel.toLowerCase()}"`}
                </p>
                {activeFilter === 'all' && (
                  <Button onClick={() => setShowForm(true)} className="gap-2">
                    <PlusCircle className="size-4" />
                    Submit Your First Complaint
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
