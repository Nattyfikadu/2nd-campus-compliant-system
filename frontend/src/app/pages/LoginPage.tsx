import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Separator } from '@/app/components/ui/separator';
import { Eye, EyeOff, ShieldCheck, ClipboardList, Bell, ArrowRight, LogIn, Search } from 'lucide-react';

const features = [
  {
    icon: ClipboardList,
    title: 'Submit Complaints Easily',
    desc: 'Report campus issues in seconds — facilities, services, or staff behavior.',
  },
  {
    icon: Bell,
    title: 'Real-Time Status Updates',
    desc: 'Track every complaint from submission to resolution, live.',
  },
  {
    icon: ShieldCheck,
    title: 'Anonymous Option Available',
    desc: 'Submit sensitive complaints without revealing your identity.',
  },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">

        {/* Soft edge fade into right panel */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-blue-600/20 blur-sm pointer-events-none" />

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 size-[500px] rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-white/5" />
        </div>

        {/* Logo + name */}
        <div className="relative flex items-center gap-3">
          <div className="size-16 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <img src="/assets/log.png" alt="Campus logo" className="size-13 rounded-lg object-cover" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Campus Service</p>
            <p className="text-blue-200 text-xs">Complaint System</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your voice matters<br />on campus.
            </h1>
            <p className="text-blue-100 text-base leading-relaxed max-w-sm">
              A transparent, fast, and fair way to report and resolve campus service issues.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-blue-200 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-blue-300 text-xs">
          Helping students, staff, and visitors get heard.
        </p>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-blue-50/60 via-white to-white">

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
          <div className="size-14 rounded-full bg-blue-600 flex items-center justify-center ring-4 ring-blue-100">
            <img src="/assets/log.png" alt="Campus logo" className="size-10 rounded-full object-cover" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Campus Service Complaint System</p>
        </div>

        <div className="w-full max-w-sm space-y-8">

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <Separator />

          {/* Register links */}
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center uppercase tracking-wide font-medium">
              New to the system? Register as
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'staff', 'visitor'] as const).map((r) => (
                <Link
                  key={r}
                  to={`/register/${r}`}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg border border-gray-200
                    text-sm text-gray-600 font-medium capitalize
                    hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700
                    transition-all duration-200"
                >
                  {r}
                  <ArrowRight className="size-3" />
                </Link>
              ))}
            </div>
          </div>

          {/* Anonymous link */}
          <div className="text-center">
            <Link
              to="/anonymous"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
            >
              <ShieldCheck className="size-3.5" />
              Submit an anonymous complaint
            </Link>
          </div>

          <div className="text-center">
            <Link
              to="/track"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
            >
              <Search className="size-3.5" />
              Track complaint status
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
