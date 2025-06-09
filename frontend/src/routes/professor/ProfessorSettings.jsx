import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

export default function ProfessorSettings() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    language: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/auth/me');
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          language: data.language || 'en',
        });
      } catch (err) {
        toast({ title: 'Failed to load profile', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await api.put('/auth/update', formData);
      toast({ title: 'Profile updated successfully!' });
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              👤 {t('Settings')}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your profile and preferences
            </p>
          </CardHeader>

          <CardContent className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred Language</label>
              <Input
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="e.g. en, fr, ht"
                disabled={loading}
              />
            </div>

            <div className="pt-2">
              <Button
                onClick={handleUpdate}
                disabled={saving || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
