import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { toast } from 'sonner';
import { ComplaintLocation, IssueType } from '@/app/context/ComplaintContext';
import { ShieldCheck, Loader2, MapPin, Tag, Paperclip, ArrowLeft, Search } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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

      toast.success('Complaint submitted successfully');
      navigate('/thank-you', { state: { trackingCode: data.trackingCode } });
    } catch {
      toast.error('Failed to submit anonymous complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 flex flex-col items-center justify-start p-4 pt-8">

      {/* Header / Branding */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="size-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg ring-4 ring-white">
          <img
            src="/assets/log.png"
            alt="Campus logo"
            className="size-14 rounded-full object-cover"
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Campus Service Complaint System</h1>
          <p className="text-sm text-slate-500 mt-0.5">Anonymous Complaint Submission</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-xs">
          <ShieldCheck className="size-3.5 text-green-600" />
          Your identity is fully protected
        </Badge>
      </div>

      {/* Form Card */}
      <Card className="w-full max-w-2xl shadow-md border-0">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Complaint Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of the issue"
                required
              />
            </div>

            {/* Location & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Location
                </Label>
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

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-muted-foreground" />
                  Category
                </Label>
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

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue in detail — the more context, the better."
                rows={6}
                required
              />
            </div>

            {/* Attachments */}
            <div className="space-y-1.5">
              <Label htmlFor="attachments" className="flex items-center gap-1.5">
                <Paperclip className="size-3.5 text-muted-foreground" />
                Attachments <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="attachments"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setFiles(e.target.files)}
                disabled={isSubmitting}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Up to 5 files · Max 20MB each · Images & videos accepted</p>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Anonymous Complaint'
              )}
            </Button>

            <Separator />

            {/* Footer links */}
            <div className="flex items-center justify-between text-sm">
              <Link
                to="/track"
                className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Search className="size-3.5" />
                Track complaint status
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                Back to login
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-slate-400 text-center max-w-sm">
        No personal information is collected or stored when submitting anonymously.
      </p>
    </div>
  );
}
