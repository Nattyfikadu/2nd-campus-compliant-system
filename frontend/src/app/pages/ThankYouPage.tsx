import { Link, useLocation } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { ModeToggle } from '@/app/components/mode-toggle';

export function ThankYouPage() {
  const location = useLocation();
  const trackingCode = (location.state as any)?.trackingCode as string | undefined;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <CheckCircle2 className="size-12 text-green-600" />
          </div>
          <CardTitle>Complaint Submitted</CardTitle>
          <CardDescription>
            Thank you for helping us improve our campus. Your feedback is important to us.
            The university will review and take necessary actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trackingCode && (
            <div className="p-4 rounded-md border bg-muted">
              <p className="text-sm font-semibold">Your tracking code</p>
              <p className="text-2xl font-bold mt-1">{trackingCode}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Save this code to check your complaint status later.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link to="/track">Check Status</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/anonymous">Submit Another</Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

