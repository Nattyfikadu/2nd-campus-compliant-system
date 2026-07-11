import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';

const API_BASE = 'http://localhost:4000';

export function TrackComplaintPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!code.trim()) {
      setError('Please enter a tracking code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/complaints/track/${encodeURIComponent(code.trim())}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || 'Tracking code not found');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Failed to check status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Check Complaint Status</CardTitle>
          <CardDescription>Enter your tracking code (example: CMP-48291)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleTrack} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="code">Tracking Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CMP-12345"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Checking...' : 'Check Status'}
            </Button>
          </form>

          {result && (
            <div className="p-4 rounded-md border space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{result.title}</p>
                <Badge variant="outline" className="capitalize">
                  {result.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Code: <span className="font-medium">{result.trackingCode}</span>
              </p>
              {result.rejectionReason && (
                <p className="text-sm text-red-600">Rejection reason: {result.rejectionReason}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Link to="/anonymous" className="text-blue-600 dark:text-blue-400 hover:underline">
              Submit anonymous complaint
            </Link>
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

