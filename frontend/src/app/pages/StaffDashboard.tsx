import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useComplaints } from '@/app/context/ComplaintContext';
import { ComplaintManagementCard } from '@/app/components/ComplaintManagementCard';
import { Card, CardContent } from '@/app/components/ui/card';
import { UserCheck, CheckCircle2, Clock, FileText } from 'lucide-react';

type FilterKey = 'all' | 'in-progress' | 'resolved';

export function StaffDashboard() {
  const { user } = useAuth();
  const { getComplaintsByAssignee } = useComplaints();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  if (!user) return null;

  const assignedComplaints = getComplaintsByAssignee(user.id);
  const inProgressCount = assignedComplaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = assignedComplaints.filter(c => c.status === 'resolved').length;

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
      key: 'all',
      label: 'Total Assigned',
      value: assignedComplaints.length,
      icon: UserCheck,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'from-blue-50 to-white',
      activeBg: 'ring-2 ring-blue-400',
    },
    {
      key: 'in-progress',
      label: 'In Progress',
      value: inProgressCount,
      icon: Clock,
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
    },
  ];

  const filteredComplaints = activeFilter === 'all'
    ? assignedComplaints
    : assignedComplaints.filter(c => c.status === activeFilter);

  const activeLabel = stats.find(s => s.key === activeFilter)?.label ?? 'All';

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.fullName || user.name}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage complaints assigned to you
        </p>
      </div>

      {/* Stat Cards — click to filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <p className="text-4xl font-bold text-gray-900 leading-none">
                      {stat.value}
                    </p>
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
              <p className="text-muted-foreground text-sm">
                {activeFilter === 'all'
                  ? 'No complaints assigned to you yet'
                  : `No complaints with status "${activeLabel.toLowerCase()}"`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map((complaint) => (
              <ComplaintManagementCard
                key={complaint.id}
                complaint={complaint}
                canResolve={complaint.status === 'in-progress'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
