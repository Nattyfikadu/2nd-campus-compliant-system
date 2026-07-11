import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, ArrowLeft, Check, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

function getPasswordStrength(pw: string) {
  const checks = [
    { label: 'At least 8 characters', ok: pw.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(pw) },
    { label: 'Number', ok: /[0-9]/.test(pw) },
    { label: 'Special character', ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  return { score: checks.filter(c => c.ok).length, checks };
}

export function ChangePasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.next.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const { score } = getPasswordStrength(form.next);
    if (score < 4) {
      setError('Password must contain uppercase, number and special character');
      return;
    }
    if (form.next !== form.confirm) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: form.current,
          newPassword: form.next,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully');
      navigate('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-gray-700">
              <ArrowLeft className="size-4" />
            </button>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5" />
              Change Password
            </CardTitle>
          </div>
          <CardDescription>Enter your current password and choose a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current Password</Label>
              <div className="relative">
                <Input
                  id="current"
                  type={showCurrent ? 'text' : 'password'}
                  value={form.current}
                  onChange={(e) => setForm({ ...form, current: e.target.value })}
                  required
                  className="h-10 pr-9"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700">
                  {showCurrent ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="next">New Password</Label>
              <div className="relative">
                <Input
                  id="next"
                  type={showNext ? 'text' : 'password'}
                  value={form.next}
                  onChange={(e) => setForm({ ...form, next: e.target.value })}
                  required
                  minLength={6}
                  className="h-10 pr-9"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowNext(!showNext)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700">
                  {showNext ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
                className="h-10"
              />
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
                  Updating...
                </span>
              ) : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
