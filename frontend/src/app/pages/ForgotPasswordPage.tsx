import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

type Step = 'email' | 'otp' | 'password';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // fallback OTP shown on page if email fails
  const [fallbackOtp, setFallbackOtp] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return; }
      if (data.fallback && data.otp) setFallbackOtp(data.otp);
      setStep('otp');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid OTP'); return; }
      setResetToken(data.resetToken);
      setStep('password');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to reset password'); return; }
      toast.success('Password reset successfully');
      navigate('/');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const stepConfig = {
    email: { title: 'Forgot Password', desc: 'Enter your email to receive a 6-digit reset code', icon: Mail },
    otp: { title: 'Enter OTP', desc: `We sent a 6-digit code to ${email}`, icon: ShieldCheck },
    password: { title: 'New Password', desc: 'OTP verified. Set your new password.', icon: KeyRound },
  };

  const { title, desc, icon: Icon } = stepConfig[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 mb-1 w-fit">
            <ArrowLeft className="size-3.5" />
            Back to login
          </Link>
          <CardTitle className="flex items-center gap-2">
            <Icon className="size-5" />
            {title}
          </CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-2">
            {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === s ? 'bg-blue-600 text-white'
                  : ['email', 'otp', 'password'].indexOf(step) > i ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-500'}`}>
                  {['email', 'otp', 'password'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                {i < 2 && <div className={`h-0.5 w-8 ${['email', 'otp', 'password'].indexOf(step) > i ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1 — Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@campus.edu"
                  value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              {error && <Alert variant="destructive" className="py-2"><AlertDescription className="text-sm">{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <span className="flex items-center gap-2"><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</span> : 'Send OTP'}
              </Button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {fallbackOtp && (
                <Alert className="py-2 border-amber-200 bg-amber-50">
                  <AlertDescription className="text-sm text-amber-800">
                    Email delivery unavailable. Your OTP is: <span className="font-bold text-lg tracking-widest">{fallbackOtp}</span>
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="otp">6-digit OTP code</Label>
                <Input id="otp" type="text" inputMode="numeric" maxLength={6}
                  placeholder="000000" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required className="h-11 text-center text-2xl tracking-widest font-bold" />
                <p className="text-xs text-muted-foreground">Check your email for the code. Expires in 10 minutes.</p>
              </div>
              {error && <Alert variant="destructive" className="py-2"><AlertDescription className="text-sm">{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full h-11" disabled={loading || otp.length !== 6}>
                {loading ? <span className="flex items-center gap-2"><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</span> : 'Verify OTP'}
              </Button>
              <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="w-full text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                Didn't receive it? Go back and resend
              </button>
            </form>
          )}

          {/* Step 3 — New Password */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters" value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11 pr-10" />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" placeholder="Re-enter password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="h-11" />
              </div>
              {error && <Alert variant="destructive" className="py-2"><AlertDescription className="text-sm">{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <span className="flex items-center gap-2"><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</span> : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
