import React, { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components2/ui/dialog';
import { Button } from '@/components2/ui/button';
import { Input } from '@/components2/ui/input';
import { updateProfile, getMe } from '@/services/auth';

export default function ProfileSettingsModal({ open, onClose }) {
  const [profile, setProfile] = useState({
    profile_image_url: '',
    bio: '',
    language: 'en',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getMe().then((res) => {
        setProfile({
          profile_image_url: res.profile_image_url || '',
          bio: res.bio || '',
          language: res.language || 'en',
        });
      });
    }
  }, [open]);

  const handleChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profile);
      onClose();
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('🧹 Cache cleared!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>👤 Profile & Settings</DialogTitle>
        </DialogHeader>

        <Tabs.Root defaultValue="profile" className="w-full">
          <Tabs.List className="flex border-b mb-4">
            <Tabs.Trigger
              value="profile"
              className="px-4 py-2 font-medium text-sm border-b-2 data-[state=active]:border-blue-600"
            >
              👤 Profile
            </Tabs.Trigger>
            <Tabs.Trigger
              value="settings"
              className="px-4 py-2 font-medium text-sm border-b-2 data-[state=active]:border-blue-600"
            >
              ⚙️ Settings
            </Tabs.Trigger>
          </Tabs.List>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Tab */}
            <Tabs.Content value="profile">
              <label className="text-sm font-semibold">🖼️ Profile Image URL</label>
              <Input
                value={profile.profile_image_url}
                onChange={handleChange('profile_image_url')}
                placeholder="https://your-image.jpg"
              />
              {profile.profile_image_url && (
                <img
                  src={profile.profile_image_url}
                  alt="Preview"
                  className="mt-2 w-24 h-24 rounded-full object-cover"
                />
              )}

              <label className="text-sm font-semibold mt-4 block">📝 Bio</label>
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                value={profile.bio}
                onChange={handleChange('bio')}
                placeholder="Tell us about yourself..."
              />
            </Tabs.Content>

            {/* Settings Tab */}
            <Tabs.Content value="settings">
              <label className="text-sm font-semibold">🌍 Language</label>
              <select
                className="w-full border rounded p-2"
                value={profile.language}
                onChange={handleChange('language')}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ht">Kreyòl Ayisyen</option>
              </select>

              <Button
                type="button"
                variant="destructive"
                className="mt-4"
                onClick={clearCache}
              >
                🧹 Clear Cache
              </Button>
            </Tabs.Content>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Tabs.Root>
      </DialogContent>
    </Dialog>
  );
}
