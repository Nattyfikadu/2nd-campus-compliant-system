import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { ArrowLeft, Mail } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (!res.ok) {
        setError(data.error || 'Failed to send reset email');
        return;
      }
      if (data.resetUrl) setResetUrl(data.resetUrl);
      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 mb-1 w-fit">
            <ArrowLeft className="size-3.5" />
            Back to login
          </Link>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Forgot Password
          </CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center space-y-3 py-4">
              <div className="size-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Mail className="size-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Request received</p>
              {resetUrl ? (
                <div className="space-y-3 text-left p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    Email delivery is currently unavailable. Use the button below to reset your password directly:
                  </p>
                  <a href={resetUrl} className="block">
                    <Button className="w-full">Reset My Password</Button>
                  </a>
                  <p className="text-xs text-blue-600">This link expires in 1 hour.</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  If <span className="font-medium">{email}</span> is registered, you'll receive a reset link shortly.
                </p>
              )}
              <Link to="/" className="text-sm text-blue-600 hover:underline block mt-2">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
