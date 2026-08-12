import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendUp, TrendDown, Package, ChartBar } from '@phosphor-icons/react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock stats for demonstration
  const stats = [
    { title: 'Total Sales', value: '$45,231.89', trend: '+12.5%', trendUp: true },
    { title: 'Grain Intake', value: '2,847 kg', trend: '-3.2%', trendUp: false },
    { title: 'Milling Output', value: '1,893 kg', trend: '+8.1%', trendUp: true },
    { title: 'Total Expenses', value: '$12,345.00', trend: '-5.4%', trendUp: true },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.full_name || 'User'}!
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <Button className="rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white px-6 py-3 text-base">
          <Plus className="mr-2 h-5 w-5" />
          New Sale
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-2xl border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {stat.trendUp ? (
                  <TrendUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stat.trend}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-base text-gray-500 dark:text-gray-400">
              Latest transactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <p className="text-base text-gray-600 dark:text-gray-300">
                  No recent activity to display.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Start by recording your first sale or grain intake.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-base text-gray-500 dark:text-gray-400">
              Common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white py-3 text-base">
              <Plus className="mr-2 h-5 w-5" />
              New Sale
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl py-3 text-base">
              <Package className="mr-2 h-5 w-5" />
              Record Grain Intake
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl py-3 text-base">
              <ChartBar className="mr-2 h-5 w-5" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;