import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { StudentDashboard } from '@/app/pages/StudentDashboard';
import { StaffDashboard } from '@/app/pages/StaffDashboard';
import { OfficeDashboard } from '@/app/pages/OfficeDashboard';
import { AdminDashboard } from '@/app/pages/AdminDashboard';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { GraduationCap, LogOut } from 'lucide-react';

export function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserDisplayName = () => {
    return user.fullName || user.name || 'User';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      student: 'bg-blue-100 text-blue-700',
      visitor: 'bg-gray-100 text-gray-700',
      staff: 'bg-green-100 text-green-700',
      office: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
      case 'visitor':
        return <StudentDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'office':
        return <OfficeDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center">
                <GraduationCap className="size-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Campus Complaint System</h1>
                <p className="text-xs text-gray-500">Issue Management & Tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              {/* Quick logout icon button */}
              <Button
                variant="outline"
                size="icon"
                className="hidden sm:inline-flex"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut className="size-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative size-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(getUserDisplayName())}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className={`text-xs px-2 py-1 rounded-full w-fit capitalize ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
}