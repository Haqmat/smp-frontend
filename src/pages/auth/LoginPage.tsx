import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, Phone, Lock, Eye, EyeSlash, Plant } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  username?: string;
  phone?: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'username' | 'phone'>('username');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const credentials = loginMethod === 'username' 
        ? { username: data.username, password: data.password }
        : { phone: data.phone, password: data.password };

      const response = await login(credentials);
      
      toast.success('Login Successful', {
        description: `Welcome back, ${response.user.full_name}!`,
      });
      
      if (response.user.is_first_login) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const message = error?.message || 'Invalid username/phone or password';
      setError('root', { message });
      toast.error('Login Failed', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md rounded-2xl border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#a38413] flex items-center justify-center text-white font-bold text-2xl shadow-md">
              <Plant className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to Haqmat
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-2">
          <Tabs 
            defaultValue="username" 
            value={loginMethod} 
            onValueChange={(value) => setLoginMethod(value as 'username' | 'phone')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 h-12">
              <TabsTrigger 
                value="username"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm text-sm font-medium"
              >
                <User className="mr-2 h-4 w-4" />
                Username
              </TabsTrigger>
              <TabsTrigger 
                value="phone"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm text-sm font-medium"
              >
                <Phone className="mr-2 h-4 w-4" />
                Phone Number
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              {/* Username Tab */}
              <TabsContent value="username" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      className="pl-10 pr-4 py-2.5 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#a38413]/30 focus:border-[#a38413] h-11"
                      {...register('username', { 
                        required: loginMethod === 'username' ? 'Username is required' : false,
                      })}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.username.message}</p>
                  )}
                </div>
              </TabsContent>

              {/* Phone Tab */}
              <TabsContent value="phone" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+251 9XX XXX XXX"
                      className="pl-10 pr-4 py-2.5 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#a38413]/30 focus:border-[#a38413] h-11"
                      {...register('phone', { 
                        required: loginMethod === 'phone' ? 'Phone number is required' : false,
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>
              </TabsContent>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-12 py-2.5 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#a38413]/30 focus:border-[#a38413] h-11"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Error Message */}
              {errors.root && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-center py-4 px-6">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Haqmat Sales Management Platform v1.0
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;