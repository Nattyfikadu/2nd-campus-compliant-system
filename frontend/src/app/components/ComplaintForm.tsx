import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useComplaints, ComplaintLocation, IssueType } from '@/app/context/ComplaintContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { FileText, MapPin, AlertTriangle } from 'lucide-react';

const locations: { value: ComplaintLocation; label: string; icon: string }[] = [
  { value: 'cafeteria', label: 'Cafeteria', icon: '🍽️' },
  { value: 'dormitory', label: 'Dormitory', icon: '🏠' },
  { value: 'registrar', label: 'Registrar Office', icon: '📋' },
  { value: 'hr-office', label: 'HR Office', icon: '👥' },
  { value: 'faculty', label: 'Faculty Building', icon: '🎓' },
  { value: 'library', label: 'Library', icon: '📚' },
];

const issueTypes: { value: IssueType; label: string; icon: string }[] = [
  { value: 'service-problem', label: 'Service Problem', icon: '⚙️' },
  { value: 'staff-behavior', label: 'Staff Behavior', icon: '👤' },
  { value: 'security-issue', label: 'Security Issue', icon: '🔒' },
  { value: 'facility-problem', label: 'Facility Problem', icon: '🔧' },
  { value: 'academic-issue', label: 'Academic Issue', icon: '📖' },
];

interface ComplaintFormProps {
  onSuccess?: () => void;
}

export function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const { user } = useAuth();
  const { addComplaint } = useComplaints();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '' as ComplaintLocation,
    category: '' as IssueType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to submit a complaint');
      return;
    }

    if (!formData.title || !formData.description || !formData.location || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    await addComplaint({
      title: formData.title,
      description: formData.description,
      location: formData.location,
      category: formData.category,
      submittedBy: {
        id: user.id,
        name: user.fullName || user.name || 'Unknown User',
        email: user.email,
      },
    });

    toast.success('Complaint submitted successfully!', {
      description: 'Your complaint has been submitted and is pending review.',
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      location: '' as ComplaintLocation,
      category: '' as IssueType,
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          Submit New Complaint
        </CardTitle>
        <CardDescription>
          Report an issue or concern about campus services, facilities, or staff
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="required">Complaint Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of the issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="size-4" />
                Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value as ComplaintLocation })}
                required
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      <span className="flex items-center gap-2">
                        <span>{loc.icon}</span>
                        {loc.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Issue Type
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as IssueType })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
            />
            <p className="text-xs text-gray-500">
              Include as much detail as possible to help us resolve your issue quickly
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Submit Complaint
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                title: '',
                description: '',
                location: '' as ComplaintLocation,
                category: '' as IssueType,
              })}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
