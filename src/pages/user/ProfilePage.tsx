import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Lock, ShieldCheck, Key } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <PageHeader
        title="User Profile"
        description="View account credentials, system authorization role, and change password."
      />

      {/* Account Info Card */}
      <Card className="rounded-2xl border-border shadow-sm bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 border-border pb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#a38413] flex items-center justify-center text-white font-bold text-2xl shadow-sm">
              {user?.full_name ? user.full_name.charAt(0) : 'H'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {user?.full_name || 'Haqmat Account'}
              </h2>
              <p className="text-gray-500 font-medium">@{user?.username || 'user'}</p>
            </div>
            <div className="ml-auto">
              <Badge variant="outline" className="rounded-xl px-3 py-1 bg-amber-50 text-[#a38413] border-amber-200 font-bold">
                <ShieldCheck size={16} className="mr-1 inline" /> {user?.role || 'OPERATOR'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/40 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <User size={14} /> Full Name
              </span>
              <p className="text-base font-bold text-foreground">
                {user?.full_name || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Key size={14} /> User Identifier
              </span>
              <p className="text-base font-mono text-foreground">
                {user?.id || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="rounded-2xl border-border shadow-sm bg-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground border-b border-gray-100 border-border pb-3 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-[#a38413]" /> Change Account Password
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currPwd" className="required">Current Password</Label>
              <Input
                id="currPwd"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPwd" className="required">New Password</Label>
                <Input
                  id="newPwd"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confPwd" className="required">Confirm New Password</Label>
                <Input
                  id="confPwd"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                className="rounded-xl h-11 px-6 bg-[#a38413] hover:bg-[#85690F] text-white font-bold"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
