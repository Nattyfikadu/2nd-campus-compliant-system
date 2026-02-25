import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { GraduationCap } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-blue-600 flex items-center justify-center">
              <GraduationCap className="size-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Campus Complaint System</CardTitle>
            <CardDescription>Sign in to submit and track your complaints</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Register here
              </Link>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <p className="font-semibold">Register as:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <Link to="/register/student" className="block text-blue-600 hover:underline">
                  Student
                </Link>
                <Link to="/register/staff" className="block text-blue-600 hover:underline">
                  Staff
                </Link>
                <Link to="/register/visitor" className="block text-blue-600 hover:underline">
                  Visitor
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
