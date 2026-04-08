import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'visitor' | 'staff' | 'office' | 'admin';

export interface User {
  id: string;
  fullName: string;
  name?: string; // For backward compatibility
  email: string;
  role: UserRole;
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
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; error?: string; requiresApproval?: boolean }>;
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

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to load user from localStorage', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        return { success: false, error: data?.error || 'Login failed' };
      }

      const data = await res.json();
      const userData = {
        ...data.user,
        name: data.user.fullName, // For backward compatibility
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (
    userData: RegisterData
  ): Promise<{ success: boolean; error?: string; requiresApproval?: boolean }> => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Registration failed' };
      }

      const data = await res.json();
      const newUser = {
        ...data.user,
        name: data.user.fullName, // For backward compatibility
      };
      // For staff: do NOT auto-login until office/admin approves.
      if (userData.role === 'staff' && !data.user.staffApproved) {
        return { success: true, requiresApproval: true };
      }

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
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
        ? `http://localhost:4000/api/auth/staff?location=${encodeURIComponent(location)}`
        : 'http://localhost:4000/api/auth/staff';
      const res = await fetch(url);
      if (!res.ok) {
        return [];
      }
      return await res.json();
    } catch (err) {
      console.error('Fetch staff error:', err);
      return [];
    }
  };

  const getPendingStaff = async (): Promise<User[]> => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/staff/pending');
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error('Fetch pending staff error:', err);
      return [];
    }
  };

  const approveStaff = async (staffId: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:4000/api/auth/staff/${staffId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorRole: user?.role }),
      });
      if (!res.ok) return false;
      return true;
    } catch (err) {
      console.error('Approve staff error:', err);
      return false;
    }
  };

  const rejectStaff = async (staffId: string, rejectionReason: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:4000/api/auth/staff/${staffId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorRole: user?.role,
          rejectionReason,
        }),
      });
      if (!res.ok) return false;
      return true;
    } catch (err) {
      console.error('Reject staff error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        getAllStaff,
        getPendingStaff,
        approveStaff,
        rejectStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
