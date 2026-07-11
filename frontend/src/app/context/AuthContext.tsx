import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE } from '@/lib/api';

export type UserRole = 'student' | 'visitor' | 'staff' | 'office' | 'admin';

export interface User {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  role: UserRole;
  isNewUser?: boolean;
  department?: string;
  faculty?: string;
  studentId?: string;
  staffId?: string;
  phone?: string;
  position?: string;
  staffLocations?: string[];
  staffApproved?: boolean;
  staffRejected?: boolean;
  staffRejectionReason?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; requiresApproval?: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  getAllStaff: (location?: string) => Promise<User[]>;
  getPendingStaff: () => Promise<User[]>;
  approveStaff: (staffId: string) => Promise<boolean>;
  rejectStaff: (staffId: string, rejectionReason: string) => Promise<boolean>;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
  staffId?: string;
  phone?: string;
  department?: string;
  faculty?: string;
  position?: string;
  staffLocations?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        return { success: false, error: data?.error || 'Login failed' };
      }
      const data = await res.json();
      const userData = { ...data.user, name: data.user.fullName, isNewUser: true };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify({ ...userData, isNewUser: false }));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string; requiresApproval?: boolean }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Registration failed' };
      }
      const data = await res.json();
      const newUser = { ...data.user, name: data.user.fullName };
      if (userData.role === 'staff' && !data.user.staffApproved) {
        return { success: true, requiresApproval: true };
      }
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const getAllStaff = async (location?: string): Promise<User[]> => {
    try {
      const url = location
        ? `${API_BASE}/api/auth/staff?location=${encodeURIComponent(location)}`
        : `${API_BASE}/api/auth/staff`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const getPendingStaff = async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/staff/pending`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const approveStaff = async (staffId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/staff/${staffId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorRole: user?.role }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const rejectStaff = async (staffId: string, rejectionReason: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/staff/${staffId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorRole: user?.role, rejectionReason }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, getAllStaff, getPendingStaff, approveStaff, rejectStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
