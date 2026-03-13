import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import { ComplaintLocation, IssueType } from '@/app/context/ComplaintContext';
import { FileText, Loader2 } from 'lucide-react';
import { ModeToggle } from '@/app/components/mode-toggle';

const API_BASE = 'http://localhost:4000';

const locations: { value: ComplaintLocation; label: string }[] = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'cafeteria', label: 'Cafeteria' },
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'registrar', label: 'Registrar Office' },
  { value: 'hr-office', label: 'HR Office' },
  { value: 'faculty', label: 'Faculty Building' },
  { value: 'library', label: 'Library' },
];

const issueTypes: { value: IssueType; label: string }[] = [
  { value: 'other', label: 'Other' },
  { value: 'service-problem', label: 'Service Problem' },
  { value: 'staff-behavior', label: 'Staff Behavior' },
  { value: 'security-issue', label: 'Security Issue' },
  { value: 'facility-problem', label: 'Facility Problem' },
  { value: 'academic-issue', label: 'Academic Issue' },
];

export function AnonymousComplaintPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'unknown' as ComplaintLocation,
    category: 'other' as IssueType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('location', formData.location);
      fd.append('category', formData.category);

      if (files && files.length > 0) {
        Array.from(files).forEach((file) => fd.append('files', file));
      }

      const res = await fetch(`${API_BASE}/api/complaints/anonymous`, {
        method: 'POST',
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.error || 'Failed to submit anonymous complaint');
        return;
      }

      toast.success('Complaint submitted');
      navigate('/thank-you', { state: { trackingCode: data.trackingCode } });
    } catch (err) {
      toast.error('Failed to submit anonymous complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Submit Anonymous Complaint
          </CardTitle>
          <CardDescription>
            Your identity will not be stored. You can optionally attach photo/video proof.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Complaint Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Complaint Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the issue in detail..."
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location (Optional)</Label>
                <Select
                  value={formData.location}
                  onValueChange={(v) => setFormData({ ...formData, location: v as ComplaintLocation })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category (Optional)</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as IssueType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setFiles(e.target.files)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Up to 5 files. Max 20MB each.</p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Anonymous Complaint'
              )}
            </Button>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link to="/track" className="text-blue-600 dark:text-blue-400 hover:underline">
                Check complaint status
              </Link>
              <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

