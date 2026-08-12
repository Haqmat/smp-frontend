import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Lock, Eye, EyeSlash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, changePassword, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('new_password');

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (data.new_password !== data.confirm_password) {
      setError('confirm_password', { message: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      // Update user to mark first login as complete
      if (user) {
        updateUser({
          ...user,
          is_first_login: false,
        });
      }

      toast.success('Password Changed', {
        description: 'Your password has been updated successfully.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      const message = error?.message || 'Failed to change password';
      setError('root', { message });
      toast.error('Password Change Failed', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md rounded-2xl border-gray-200 dark:border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#a38413] flex items-center justify-center text-white font-bold text-2xl">
              H
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Change Password
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Please change your password before continuing
          </CardDescription>
          <CardDescription className="text-sm text-[#a38413] font-medium mt-2">
            Welcome, {user?.full_name || 'User'}!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password" className="text-gray-700 dark:text-gray-300">
                Current Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="current_password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className="pl-9 pr-10 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-[#a38413]/20"
                  {...register('current_password', { 
                    required: 'Current password is required' 
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.current_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="pl-9 pr-10 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-[#a38413]/20"
                  {...register('new_password', { 
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.new_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-gray-700 dark:text-gray-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="pl-9 pr-10 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-[#a38413]/20"
                  {...register('confirm_password', { 
                    required: 'Please confirm your password',
                    validate: (value) => 
                      value === newPassword || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.confirm_password.message}</p>
              )}
            </div>

            {errors.root && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
          <p>Haqmat Sales Management Platform v1.0</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;