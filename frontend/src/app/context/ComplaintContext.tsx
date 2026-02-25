import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from './AuthContext';

export type ComplaintStatus = 'pending' | 'approved' | 'in-progress' | 'resolved' | 'rejected';

export type ComplaintLocation = 
  | 'cafeteria' 
  | 'dormitory' 
  | 'registrar' 
  | 'hr-office' 
  | 'faculty' 
  | 'library';

export type IssueType = 
  | 'service-problem' 
  | 'staff-behavior' 
  | 'security-issue' 
  | 'facility-problem' 
  | 'academic-issue';

export interface Complaint {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  rejectionReason?: string;
}

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, assignedTo?: { id: string; name: string }, rejectionReason?: string) => void;
  getComplaintsByUser: (userId: string) => Complaint[];
  getComplaintsByStatus: (status: ComplaintStatus) => Complaint[];
  getComplaintsByAssignee: (assigneeId: string) => Complaint[];
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

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/complaints');
        const data = await res.json();
        setComplaints(data.map(hydrateComplaintDates));
      } catch (err) {
        console.error('Failed to load complaints from API', err);
      }
    };

    fetchComplaints();
  }, []);

  const addComplaint = async (
    complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    try {
      const res = await fetch('http://localhost:4000/api/complaints', {
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
        return;
      }

      const data = await res.json();
      const newComplaint = hydrateComplaintDates(data);
      setComplaints(prev => [newComplaint, ...prev]);
    } catch (err) {
      console.error('Error creating complaint', err);
    }
  };

  const updateComplaintStatus = async (
    id: string,
    status: ComplaintStatus,
    assignedTo?: { id: string; name: string },
    rejectionReason?: string
  ) => {
    try {
      const res = await fetch(`http://localhost:4000/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedTo,
          rejectionReason,
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

  return (
    <ComplaintContext.Provider value={{
      complaints,
      addComplaint,
      updateComplaintStatus,
      getComplaintsByUser,
      getComplaintsByStatus,
      getComplaintsByAssignee
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
