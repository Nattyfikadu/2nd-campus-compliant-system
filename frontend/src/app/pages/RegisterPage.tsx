import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigate, Link, useParams } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Eye, EyeOff, GraduationCap, UserPlus, Building2, ArrowLeft } from 'lucide-react';

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
  staffLocations: [] as string[],
};

const staffLocationLabels: Record<string, string> = {
  cafeteria: 'Cafeteria',
  dormitory: 'Dormitory',
  registrar: 'Registrar Office',
  'hr-office': 'HR Office',
  faculty: 'Faculty Building',
  library: 'Library',
};

const roleConfig = {
  student: {
    icon: GraduationCap,
    label: 'Student',
    desc: 'Register with your student ID to submit and track campus complaints.',
    color: 'from-blue-700 via-blue-600 to-indigo-700',
  },
  staff: {
    icon: Building2,
    label: 'Staff',
    desc: 'Register as a staff member to receive and resolve assigned complaints.',
    color: 'from-emerald-700 via-emerald-600 to-teal-700',
  },
  visitor: {
    icon: UserPlus,
    label: 'Visitor',
    desc: 'Visiting campus? Create an account to report issues you encounter.',
    color: 'from-purple-700 via-purple-600 to-indigo-700',
  },
};

export function RegisterPage() {
  const { role: urlRole } = useParams<{ role?: string }>();
  const [role, setRole] = useState<'student' | 'staff' | 'visitor'>(
    (urlRole as 'student' | 'staff' | 'visitor') || 'student'
  );
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (role === 'staff' && formData.staffLocations.length === 0) {
      setError('Please select at least one working location');
      setLoading(false);
      return;
    }

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role,
      studentId: role === 'student' ? formData.studentId : undefined,
      staffId: role === 'staff' ? formData.staffId : undefined,
      staffLocations: role === 'staff' ? formData.staffLocations : undefined,
      phone: formData.phone || undefined,
      department: formData.department || undefined,
      faculty: formData.faculty || undefined,
      position: role === 'staff' ? formData.position : undefined,
    });

    setLoading(false);

    if (result.success) {
      if (role === 'staff' && result.requiresApproval) {
        navigate('/');
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex">

      {/* Left — Branding Panel */}
      <div className={`hidden lg:flex lg:w-5/12 bg-gradient-to-br ${config.color} flex-col justify-between p-12 relative overflow-hidden transition-all duration-500`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 size-[500px] rounded-full bg-white/5" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="size-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <img src="/assets/log.png" alt="Campus logo" className="size-9 rounded-lg object-cover" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Campus Service</p>
            <p className="text-white/60 text-xs">Complaint System</p>
          </div>
        </div>

        <div className="relative space-y-5">
          <div className="size-16 rounded-2xl bg-white/15 flex items-center justify-center">
            <Icon className="size-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">{config.label} Registration</h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">{config.desc}</p>
          </div>

          {/* Role switcher on left panel */}
          <div className="flex gap-2 pt-2">
            {(['student', 'staff', 'visitor'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200
                  ${role === r
                    ? 'bg-white text-gray-800 shadow'
                    : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Link
          to="/"
          className="relative flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors w-fit"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">

        {/* Mobile header */}
        <div className="lg:hidden w-full max-w-lg mb-6">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 mb-4">
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
          <div className="flex gap-2 mb-4">
            {(['student', 'staff', 'visitor'] as const).map((r) => (
              <Button
                key={r}
                type="button"
                size="sm"
                variant={role === r ? 'default' : 'outline'}
                onClick={() => handleRoleChange(r)}
                className="capitalize"
              >
                {r}
              </Button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-muted-foreground">Fill in the details below to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="you@campus.edu"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Student ID */}
            {role === 'student' && (
              <div className="space-y-1.5">
                <Label htmlFor="studentId">Student ID <span className="text-red-500">*</span></Label>
                <Input
                  id="studentId"
                  placeholder="Your campus student ID"
                  value={formData.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  required
                  className="h-10"
                />
              </div>
            )}

            {/* Staff ID */}
            {role === 'staff' && (
              <div className="space-y-1.5">
                <Label htmlFor="staffId">Staff ID <span className="text-red-500">*</span></Label>
                <Input
                  id="staffId"
                  placeholder="Your staff ID"
                  value={formData.staffId}
                  onChange={(e) => handleChange('staffId', e.target.value)}
                  required
                  className="h-10"
                />
              </div>
            )}

            {/* Department / Faculty */}
            {(role === 'student' || role === 'staff') && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input
                    id="faculty"
                    placeholder="e.g. Engineering"
                    value={formData.faculty}
                    onChange={(e) => handleChange('faculty', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            )}

            {/* Position */}
            {role === 'staff' && (
              <div className="space-y-1.5">
                <Label htmlFor="position">Position / Job Title</Label>
                <Input
                  id="position"
                  placeholder="e.g. Maintenance Technician"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="h-10"
                />
              </div>
            )}

            {/* Working Locations */}
            {role === 'staff' && (
              <div className="space-y-2">
                <Label>Working Locations <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-gray-50">
                  {Object.entries(staffLocationLabels).map(([loc, label]) => (
                    <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={formData.staffLocations.includes(loc)}
                        onCheckedChange={(v) => {
                          setFormData((prev) => {
                            const set = new Set(prev.staffLocations);
                            if (v === true) set.add(loc); else set.delete(loc);
                            return { ...prev, staffLocations: Array.from(set) };
                          });
                          setError('');
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+251 9XX XXX XXX"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">For status update notifications</p>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    minLength={6}
                    className="h-10 pr-9"
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700">
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    className="h-10 pr-9"
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700">
                    {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
