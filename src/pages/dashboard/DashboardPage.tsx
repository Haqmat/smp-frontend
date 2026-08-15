import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '@/api/dashboard';
import type { DashboardStats } from '@/types/api';
import { StatCard } from '@/components/data-display/StatCard';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { 
  ShoppingCart, 
  Package, 
  Wallet, 
  Scales, 
  ArrowsClockwise, 
  Plus, 
  Warning,
  ListPlus,
  BookOpen
} from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const CHART_COLORS = ['#a38413', '#dcae1d', '#f1c40f', '#e67e22'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'today' | 'this_week' | 'this_month' | 'this_year'>('this_month');
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (p: typeof period) => {
    try {
      setLoading(true);
      const res = await getDashboardData({ period: p });
      if (res.success) {
        setData(res.data);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(period);
  }, [period]);

  // Set up 60s auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard(period);
    }, 60000);
    return () => clearInterval(interval);
  }, [period]);

  // Map expense breakdown to chart format
  const getExpenseChartData = () => {
    if (!data?.expenses?.breakdown) return [];
    return Object.entries(data.expenses.breakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      value,
    }));
  };

  // Map milling data to chart format
  const getMillingChartData = () => {
    if (!data?.milling_summary) return [];
    return [
      {
        name: 'Milling',
        Grain: data.milling_summary.total_grain_milled_kg,
        Flour: data.milling_summary.total_flour_produced_kg,
      },
    ];
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader 
        title="Dashboard" 
        description="Key metrics and operational health of Haqmat SMP."
      >
        <div className="flex items-center gap-2 bg-accent p-1.5 rounded-xl text-sm font-medium">
          {(['today', 'this_week', 'this_month', 'this_year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                period === p
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchDashboard(period)}
          className="rounded-xl h-10 w-10 border-border p-0 flex items-center justify-center text-muted-foreground"
        >
          <ArrowsClockwise className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </PageHeader>

      {/* Loading state */}
      {loading && !data ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a38413]" />
        </div>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Sales Revenue"
              value={formatCurrency(data?.sales_revenue?.total_revenue_before_vat)}
              trend={data?.sales_revenue?.change_percentage_from_previous}
              icon={ShoppingCart}
              accentColor="border-l-4 border-l-[#a38413]"
            />
            <StatCard
              title="Grain Intake Cost"
              value={formatCurrency(Math.abs(data?.net_position?.grain_cost || 0))}
              trend={data?.grain_intake?.change_percentage_from_previous}
              icon={Package}
              accentColor="border-l-4 border-l-amber-500"
            />
            <StatCard
              title="Total Operating Expenses"
              value={formatCurrency(data?.expenses?.total_amount)}
              icon={Wallet}
              accentColor="border-l-4 border-l-red-500"
            />
            <StatCard
              title="Net Position"
              value={formatCurrency(data?.net_position?.net_profit_loss)}
              trend={data?.net_position?.profit_margin_percentage}
              trendLabel="net margin"
              icon={Scales}
              accentColor={
                (data?.net_position?.net_profit_loss || 0) >= 0 
                  ? 'border-l-4 border-l-green-600' 
                  : 'border-l-4 border-l-red-600'
              }
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Milling Output bar chart */}
            <div className="lg:col-span-2 bg-card text-card-foreground border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Milling Mass Balance (kg)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMillingChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-gray-800" />
                    <XAxis dataKey="name" stroke="#888888" className="text-xs" />
                    <YAxis stroke="#888888" className="text-xs" />
                    <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                    <Legend />
                    <Bar dataKey="Grain" name="Input Grain Milled" fill="#dcae1d" radius={[8, 8, 0, 0]} barSize={60} />
                    <Bar dataKey="Flour" name="Finished Flour Produced" fill="#a38413" radius={[8, 8, 0, 0]} barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense breakdown pie chart */}
            <div className="bg-card text-card-foreground border border-border flex flex-col">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Expenses by Category
              </h3>
              <div className="h-48 flex-1 relative flex items-center justify-center">
                {getExpenseChartData().length === 0 ? (
                  <p className="text-base text-gray-500">No expenses recorded</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getExpenseChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getExpenseChartData().map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-muted-foreground">
                {getExpenseChartData().map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-sm block" 
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} 
                    />
                    <span className="truncate">{item.name}: {formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom tables grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Low Stock Alerts */}
            <div className="lg:col-span-2 bg-card text-card-foreground border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Warning className="text-amber-500 w-5 h-5" />
                  Low Stock Alerts
                </h3>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg px-2 py-0.5">
                  {data?.low_stock_alerts?.length || 0} alerts
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 border-border">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Current Stock</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Threshold</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!data?.low_stock_alerts || data.low_stock_alerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                          All products are currently above their stock safety thresholds.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.low_stock_alerts.map((alert, index) => (
                        <TableRow key={index} className="border-b border-gray-50 border-border/30">
                          <TableCell className="font-medium text-foreground">{alert.product_name}</TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">{formatNumber(alert.current_stock)} kg</TableCell>
                          <TableCell className="text-right text-gray-500">{formatNumber(alert.threshold)} kg</TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/30 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10">
                              Low Stock
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/sales/new')}
                    className="w-full justify-start rounded-xl bg-[#a38413] hover:bg-[#85690F] text-white py-3 text-base"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    New Sale
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/inventory/grain-intake')}
                    className="w-full justify-start rounded-xl py-3 text-base border-border"
                  >
                    <ListPlus className="mr-2 h-5 w-5 text-[#a38413]" />
                    Record Grain Intake
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/reports/annual-sales')}
                    className="w-full justify-start rounded-xl py-3 text-base border-border"
                  >
                    <BookOpen className="mr-2 h-5 w-5 text-[#a38413]" />
                    View Reports
                  </Button>
                </div>
              </div>
              <div className="border-t border-gray-100 border-border pt-4 mt-6 text-xs text-muted-foreground text-center">
                Dashboard updates automatically every 60s
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;