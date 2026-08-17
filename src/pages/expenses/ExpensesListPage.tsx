import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listExpenses } from '@/api/expenses';
import type { Expense } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/data-display/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { usePagination } from '@/hooks/usePagination';
import { Plus, Funnel } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const ExpensesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { page, limit, setPage } = usePagination(10);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data states
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({
    TRANSPORT: 0,
    SALARY: 0,
    UTILITY: 0,
    OTHER: 0,
  });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await listExpenses({
        page,
        limit,
        category: categoryFilter === 'ALL' ? undefined : (categoryFilter as any),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (res.success) {
        setExpenses(res.data.data);
        setSummary(res.data.category_summary);
        setTotalExpenses(res.data.total_expenses);
        setTotalItems(res.data.pagination.total_items);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch {
      toast.error('Failed to load expenses list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, limit, categoryFilter, startDate, endDate]);

  const columns = [
    {
      header: 'Date (E.C.)',
      accessorKey: 'expense_date_ethiopian',
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (row: Expense) => (
        <Badge variant="outline" className="rounded-lg capitalize font-semibold">
          {row.category.toLowerCase()}
        </Badge>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row: Expense) => (
        <div>
          <span className="font-medium text-foreground block">{row.description}</span>
          {row.linked_to && (
            <span className="text-xs text-[#5A3E2B] block">
              Linked to Batch: {row.linked_to.batch_receipt} ({row.linked_to.supplier_name})
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: Expense) => (
        <span className="font-bold text-red-700 dark:text-red-400">
          {formatCurrency(row.amount)}
        </span>
      )
    },
    {
      header: 'Payment Method',
      accessorKey: 'payment_method',
      cell: (row: Expense) => row.payment_method ? row.payment_method.replace('_', ' ') : 'N/A'
    },
    {
      header: 'Recipient',
      accessorKey: 'recipient_name',
      cell: (row: Expense) => row.recipient_name || 'N/A'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operating Expenses"
        description="Track transport, payroll, utilities, and general business expenses."
      >
        <Button
          onClick={() => navigate('/expenses/new')}
          className="rounded-xl bg-[#5A3E2B] hover:bg-[#5a3d09] text-white h-11 text-base shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" />
          Record Expense
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Transport</p>
          <h4 className="text-xl font-bold text-foreground mt-1">
            {formatCurrency(summary.TRANSPORT || 0)}
          </h4>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Payroll / Salary</p>
          <h4 className="text-xl font-bold text-foreground mt-1">
            {formatCurrency(summary.SALARY || 0)}
          </h4>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Utilities</p>
          <h4 className="text-xl font-bold text-foreground mt-1">
            {formatCurrency(summary.UTILITY || 0)}
          </h4>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Other Expenses</p>
          <h4 className="text-xl font-bold text-foreground mt-1">
            {formatCurrency(summary.OTHER || 0)}
          </h4>
        </div>

        <div className="bg-card p-4 rounded-2xl border border-l-4 border-l-red-700 border-border shadow-sm">
          <p className="text-xs font-semibold text-red-700 uppercase">Total OpEx</p>
          <h4 className="text-xl font-bold text-red-700 dark:text-red-400 mt-1">
            {formatCurrency(totalExpenses)}
          </h4>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Funnel size={18} className="text-[#5A3E2B]" />
          Filter Expenses
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="filterCat">Category</Label>
            <select
              id="filterCat"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-[#5A3E2B]"
            >
              <option value="ALL">All Categories</option>
              <option value="TRANSPORT">Transport</option>
              <option value="SALARY">Salary</option>
              <option value="UTILITY">Utility</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start Date (E.C.)</Label>
            <Input
              id="startDate"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate">End Date (E.C.)</Label>
            <Input
              id="endDate"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        page={page}
        limit={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ExpensesListPage;
