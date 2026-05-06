import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_BASE } from '@/lib/api';
import { User } from './AuthContext';

export type ComplaintStatus = 'pending' | 'approved' | 'in-progress' | 'resolved' | 'rejected';

export type ComplaintLocation = 
  | 'cafeteria' 
  | 'dormitory' 
  | 'registrar' 
  | 'hr-office' 
  | 'faculty' 
  | 'library'
  | 'unknown';

export type IssueType = 
  | 'service-problem' 
  | 'staff-behavior' 
  | 'security-issue' 
  | 'facility-problem' 
  | 'academic-issue'
  | 'other';

export interface Attachment {
  url: string;
  type: 'image' | 'video' | 'audio' | 'file';
  originalName: string;
}

export interface Complaint {
  id: string;
  type?: 'student' | 'visitor' | 'anonymous';
  trackingCode?: string;
  studentId?: string;
  title: string;
  description: string;
  category: IssueType;
  location: ComplaintLocation;
  status: ComplaintStatus;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  supportStaff?: {
    id: string;
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  rejectionReason?: string;
  escalationType?: 'unavailable' | 'beyond-skill';
  escalationReason?: string;
  escalationReportedBy?: {
    id: string;
    name: string;
  };
  resolutionDescription?: string;
  resolutionAttachments?: Attachment[];
  attachments?: Attachment[];
}

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (
    complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => Promise<Complaint | null>;
  updateComplaintStatus: (
    id: string,
    status: ComplaintStatus,
    assignedTo?: { id: string; name: string },
    rejectionReason?: string,
    resolutionDescription?: string,
    resolutionAttachments?: Attachment[],
    escalationType?: 'unavailable' | 'beyond-skill',
    escalationReason?: string,
    escalationReportedBy?: { id: string; name: string },
    supportStaffAdd?: { id: string; name: string }
  ) => void;
  getComplaintsByUser: (userId: string) => Complaint[];
  getComplaintsByStatus: (status: ComplaintStatus) => Complaint[];
  getComplaintsByAssignee: (assigneeId: string) => Complaint[];
  reloadComplaints: () => Promise<void>;
  deleteComplaint: (id: string) => Promise<boolean>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Helper to convert ISO date strings from API to Date objects
  const hydrateComplaintDates = (c: any): Complaint => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    resolvedAt: c.resolvedAt ? new Date(c.resolvedAt) : undefined,
  });

  const reloadComplaints = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/complaints`);
      const json = await res.json();
      // API returns { data: [], pagination: {} } — handle both shapes
      const list = Array.isArray(json) ? json : (json.data ?? []);
      setComplaints(list.map(hydrateComplaintDates));
    } catch (err) {
      console.error('Failed to load complaints from API', err);
    }
  };

  useEffect(() => {
    reloadComplaints();
    const intervalId = window.setInterval(() => {
      reloadComplaints();
    }, 10000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        reloadComplaints();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addComplaint = async (
    complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Complaint | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          location: complaint.location,
          submittedBy: complaint.submittedBy,
        }),
      });

      if (!res.ok) {
        console.error('Failed to create complaint', await res.text());
        return null;
      }

      const data = await res.json();
      const newComplaint = hydrateComplaintDates(data);
      setComplaints(prev => [newComplaint, ...prev]);
      return newComplaint;
    } catch (err) {
      console.error('Error creating complaint', err);
      return null;
    }
  };

  const updateComplaintStatus = async (
    id: string,
    status: ComplaintStatus,
    assignedTo?: { id: string; name: string },
    rejectionReason?: string,
    resolutionDescription?: string,
    resolutionAttachments?: Attachment[],
    escalationType?: 'unavailable' | 'beyond-skill',
    escalationReason?: string,
    escalationReportedBy?: { id: string; name: string },
    supportStaffAdd?: { id: string; name: string }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedTo,
          rejectionReason,
          resolutionDescription,
          resolutionAttachments,
          escalationType,
          escalationReason,
          escalationReportedBy,
          supportStaffAdd,
        }),
      });

      if (!res.ok) {
        console.error('Failed to update complaint status', await res.text());
        return;
      }

      const data = await res.json();
      const updatedComplaint = hydrateComplaintDates(data);

      setComplaints(prev =>
        prev.map(c => (c.id === updatedComplaint.id ? updatedComplaint : c))
      );
    } catch (err) {
      console.error('Error updating complaint status', err);
    }
  };

  const getComplaintsByUser = (userId: string) => {
    return complaints.filter(c => c.submittedBy.id === userId);
  };

  const getComplaintsByStatus = (status: ComplaintStatus) => {
    return complaints.filter(c => c.status === status);
  };

  const getComplaintsByAssignee = (assigneeId: string) => {
    return complaints.filter(c => c.assignedTo?.id === assigneeId);
  };

  const deleteComplaint = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/complaints/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) return false;
      setComplaints(prev => prev.filter(c => c.id !== id));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ComplaintContext.Provider value={{
      complaints,
      addComplaint,
      updateComplaintStatus,
      getComplaintsByUser,
      getComplaintsByStatus,
      getComplaintsByAssignee,
      reloadComplaints,
      deleteComplaint,
    }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}
