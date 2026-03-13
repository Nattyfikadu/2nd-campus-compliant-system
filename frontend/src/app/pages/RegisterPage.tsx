import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigate, Link, useParams } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { GraduationCap, UserPlus, Building2 } from 'lucide-react';
import { ModeToggle } from '@/app/components/mode-toggle';

const initialFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  studentId: '',
  staffId: '',
  phone: '',
  department: '',
  faculty: '',
  position: '',
};

export function RegisterPage() {
  const { role: urlRole } = useParams<{ role?: string }>();
  const [role, setRole] = useState<'student' | 'staff' | 'visitor'>(urlRole as any || 'student');
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleRoleChange = (newRole: 'student' | 'staff' | 'visitor') => {
    setRole(newRole);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (role === 'student' && !formData.studentId) {
      setError('Student ID is required');
      setLoading(false);
      return;
    }

    if (role === 'staff' && !formData.staffId) {
      setError('Staff ID is required');
      setLoading(false);
      return;
    }

    // Register
    const registerData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role,
      studentId: role === 'student' ? formData.studentId : undefined,
      staffId: role === 'staff' ? formData.staffId : undefined,
      phone: formData.phone || undefined,
      department: formData.department || undefined,
      faculty: formData.faculty || undefined,
      position: role === 'staff' ? formData.position : undefined,
    };

    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const getIcon = () => {
    switch (role) {
      case 'student':
        return <GraduationCap className="size-8 text-white" />;
      case 'staff':
        return <Building2 className="size-8 text-white" />;
      default:
        return <UserPlus className="size-8 text-white" />;
    }
  };

  const getTitle = () => {
    switch (role) {
      case 'student':
        return 'Student Registration';
      case 'staff':
        return 'Staff Registration';
      default:
        return 'Visitor Registration';
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-blue-600 flex items-center justify-center">
              {getIcon()}
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            <CardDescription>Create your account to submit and track complaints</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Role selector */}
          <div className="mb-6 flex gap-2 justify-center">
            <Button
              type="button"
              variant={role === 'student' ? 'default' : 'outline'}
              onClick={() => handleRoleChange('student')}
              size="sm"
            >
              Student
            </Button>
            <Button
              type="button"
              variant={role === 'staff' ? 'default' : 'outline'}
              onClick={() => handleRoleChange('staff')}
              size="sm"
            >
              Staff
            </Button>
            <Button
              type="button"
              variant={role === 'visitor' ? 'default' : 'outline'}
              onClick={() => handleRoleChange('visitor')}
              size="sm"
            >
              Visitor
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@campus.edu"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            {/* Student ID (for students) */}
            {role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  placeholder="Enter your campus student ID"
                  value={formData.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  required
                />
              </div>
            )}

            {/* Staff ID (for staff) */}
            {role === 'staff' && (
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID *</Label>
                <Input
                  id="staffId"
                  placeholder="Enter your staff ID"
                  value={formData.staffId}
                  onChange={(e) => handleChange('staffId', e.target.value)}
                  required
                />
              </div>
            )}

            {/* Department/Faculty */}
            {(role === 'student' || role === 'staff') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input
                    id="faculty"
                    placeholder="e.g., Engineering"
                    value={formData.faculty}
                    onChange={(e) => handleChange('faculty', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Position (for staff) */}
            {role === 'staff' && (
              <div className="space-y-2">
                <Label htmlFor="position">Position/Job Title</Label>
                <Input
                  id="position"
                  placeholder="e.g., Maintenance Technician"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                />
              </div>
            )}

            {/* Phone (optional for all) */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+251 9XX XXX XXX"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for SMS/WhatsApp notifications when your complaint status updates
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
