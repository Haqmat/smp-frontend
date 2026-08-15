import React, { useState, useEffect } from 'react';
import { listUsers, createUser, toggleUserStatus, resetUserPassword } from '@/api/users';
import type { User } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/data-display/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Key, CheckCircle, XCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SALES' | 'MANAGER' | 'AUDITOR'>('SALES');
  const [password, setPassword] = useState('');

  // Reset Password Modal
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const res = await listUsers();
      if (res.success) {
        setUsers(res.data.data);
      }
    } catch {
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !fullName || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setFormLoading(true);
      const res = await createUser({
        username,
        full_name: fullName,
        role,
        password,
      });

      if (res.success) {
        toast.success('User account created successfully');
        setIsAddModalOpen(false);
        setUsername('');
        setFullName('');
        setPassword('');
        fetchUsersList();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await toggleUserStatus(user.id, !user.is_active);
      if (res.success) {
        toast.success(`User ${user.username} has been ${!user.is_active ? 'activated' : 'deactivated'}`);
        fetchUsersList();
      }
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    try {
      setResetLoading(true);
      const res = await resetUserPassword(resetUserId, newPassword);
      if (res.success) {
        toast.success('Password reset successfully');
        setResetUserId(null);
        setNewPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const columns = [
    {
      header: 'Full Name',
      accessorKey: 'full_name',
      cell: (row: User) => (
        <span className="font-bold text-foreground">{row.full_name}</span>
      )
    },
    {
      header: 'Username',
      accessorKey: 'username',
      cell: (row: User) => `@${row.username}`
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (row: User) => {
        const color = row.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200';
        return (
          <Badge variant="outline" className={`rounded-lg font-bold ${color}`}>
            {row.role}
          </Badge>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: (row: User) => (
        row.is_active ? (
          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-lg text-xs font-semibold">
            <CheckCircle size={14} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg text-xs font-semibold">
            <XCircle size={14} /> Inactive
          </span>
        )
      )
    },
    {
      header: 'Actions',
      cell: (row: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(row)}
            className="rounded-xl h-9"
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setResetUserId(row.id)}
            className="rounded-xl text-[#a38413] hover:bg-amber-50 dark:hover:bg-amber-950/20 h-9"
          >
            <Key size={16} className="mr-1 inline" /> Reset Pwd
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Access Control"
        description="Manage user credentials, system roles, and account statuses."
      >
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white h-11 text-base shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New User
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
      />

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && setIsAddModalOpen(false)}>
        <DialogContent className="max-w-md bg-card rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add System User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="addFullName" className="required">Full Name</Label>
              <Input
                id="addFullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. አቶ አበበ በቀለ"
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addUsername" className="required">Username</Label>
              <Input
                id="addUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. abebe"
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addRole" className="required">System Role</Label>
              <select
                id="addRole"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#a38413]"
              >
                <option value="SALES">Sales Operator</option>
                <option value="MANAGER">Factory Manager</option>
                <option value="ADMIN">System Administrator</option>
                <option value="AUDITOR">Auditor (Read Only)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addPwd" className="required">Password</Label>
              <Input
                id="addPwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl h-11 px-5"
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl h-11 px-5 bg-[#a38413] hover:bg-[#85690F] text-white"
                disabled={formLoading}
              >
                {formLoading ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={!!resetUserId} onOpenChange={(open) => !open && setResetUserId(null)}>
        <DialogContent className="max-w-md bg-card rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Reset Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="newPwd" className="required">New Password</Label>
              <Input
                id="newPwd"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="h-11 rounded-xl"
              />
            </div>

            <DialogFooter className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetUserId(null)}
                className="rounded-xl h-11 px-5"
                disabled={resetLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleResetPassword}
                className="rounded-xl h-11 px-5 bg-[#a38413] hover:bg-[#85690F] text-white"
                disabled={resetLoading}
              >
                {resetLoading ? 'Resetting...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
